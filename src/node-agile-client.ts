import axios from 'axios'
import path from 'path'
import fs from 'fs-extra'
// utils
import { generateAuthorization, transformConfig, getTime, generateUrl } from './utils'
import { WS } from './ws'
// const
import { WEBSOCKET_ACTION } from './const/ws'
import { Config, Data } from "./types";

// 配置缓存
let agileConfigCache: Data

/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<void>}
 */
export async function init(options: Config) {
  const { appid, secret, nodes } = options
  if (options.debug) console.info({ message: '【agile】传入参数：', data: options })
  if (!appid || !secret || !nodes) {
    console.error({
      message: '【agile】初始化参数不完整！',
    });
    process.exit(-1);
  }
  const beginTime = Date.now();
  // 生成请求头
  // @ts-ignore
  options.headers = generateAuthorization(options)
  if (options.debug) {
    // @ts-ignore
    console.info({ message: '【agile】请求头：', data: options.headers })
  }
  // 初始化agile配置
  try {
    await initAgileConfig(options);
    console.info(`【agile】: 初始化agile服务成功，耗时: ${Date.now() - beginTime}ms。`);
  } catch (err) {
    console.error({
      message: '【agile】: 初始化agile失败',
      error: err
    });
    // 退出进程
    process.exit(-1);
  }
}

/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<*|undefined>}
 */
async function initAgileConfig(options: Config) {
  // websocket长连接
  setTimeout(() => {
    getNotifications(options)
  })
  await getAgileConfigAsync(options, true);
}

/**
 * websocket连接
 * @param options
 */
function getNotifications(options: Config) {
  // 生成wsUrl
  const wsPaths = generateUrl(options, true)
  if (options.debug) console.info({ message: '【agile】：websocket所有请求地址', data: wsPaths })

  function connect(index: number) {
    try {
      const ws = new WS(wsPaths[index], {
        debug: !!options.debug,
        // @ts-ignore
        wsOptions: { headers: options.headers },
      })
      ws.websocketOnOpen(() => {
        console.info(`【agile】: websocket连接成功，连接地址：${wsPaths[index]}`)
      })
      ws.websocketOnMessage((data: any) => {
        if (options.debug) console.info('【agile】：客户端收到消息：' + data)
        if (data.indexOf("Action") !== -1) {
          // 服务端更新了
          const { Action: action } = JSON.parse(data)
          if (action === WEBSOCKET_ACTION.RELOAD) {
            getAgileConfigAsync(options, false).catch()
          }
          if (action === WEBSOCKET_ACTION.OFFLINE) {
            ws.removeSocket()
          }
        } else if (data !== '0' && data.startsWith('V:')) {
          if (options.debug) {
            console.info('【agile】: 服务端的MD5：' + data.slice(2))
            console.info('【agile】: 缓存中的MD5：' + agileConfigCache.md5)
          }
          // 心跳检测时/服务端主动关闭连接时，同步配置
          if (data.slice(2) !== agileConfigCache.md5) {
            console.info('【agile】: 配置更新，即将重新读取配置')
            getAgileConfigAsync(options, false).catch()
          }
        }
      })
      ws.websocketOnError((err: any) => {
        console.warn({
          message: '【agile】: websocket连接发生错误，正在尝试重新连接...',
          error: err
        });
        throw err
      })
      ws.websocketOnClose(() => {
        console.warn('【agile】: websocket断开连接，将会读取本地缓存');
      })
    } catch (err) {
      index = index + 1;
      if (index < wsPaths.length) {
        connect(index)
      } else {
        console.error({
          url: `【agile】：请求地址：${wsPaths}`,
          message: `【agile】：websocket连接失败，将会读取本地缓存`,
          error: err,
        })
      }
    }
  }
  connect(0)
}

/**
 * 异步获取agile配置
 * @param options
 * @param useCache 是否使用缓存
 * @returns {Promise<*>}
 */
async function getAgileConfigAsync(options: Config, useCache: boolean) {
  if (useCache) {
    // 优先从缓存中获取信息
    const agileConfig = getAgileConfigFromCache();
    if (agileConfig) {
      return agileConfig;
    }
    console.info('【agile】: 开始初始化agile配置(通过接口获取)');
  }
  // 从接口中获取
  try {
    agileConfigCache = await getAgileConfigPromise(options);
    if (options.debug) console.info({
      message: '【agile】：JSON数据',
      data: agileConfigCache
    })
    fs.writeJsonSync(path.resolve(__dirname, './agileConfig.json'), agileConfigCache);
    console.info(`【agile】: 更新缓存成功, 更新时间：${getTime()}`)
    return agileConfigCache;
  } catch (err) {
    console.warn({
      message: '【agile】: 更新缓存失败，将会读取本地缓存',
      error: err
    });
    throw err;
  }
}

/**
 * 从缓存中获取agile配置
 * @returns {*}
 */
function getAgileConfigFromCache() {
  if (agileConfigCache) {
    return agileConfigCache;
  }
  try {
    const cacheFile = path.join(__dirname, './agileConfig.json');
    const isHave = !!fs.statSync(cacheFile).size;
    console.info('【agile】: 开始初始化agile配置(通过缓存获取)');
    if (isHave) {
      agileConfigCache = fs.readJsonSync(path.resolve(__dirname, './agileConfig.json'));
      if (agileConfigCache) {
        return agileConfigCache
      }
    }
  } catch (err) {}

  return agileConfigCache;
}

/**
 * 从agile中获取配置并写入缓存
 * @param options
 * @returns {Promise<*>}
 */
async function getAgileConfigPromise(options: Config): Promise<any> {
  // 获取url
  const urlPaths = generateUrl(options, false);
  if (options.debug) console.info({ message: '【agile】所有接口请求地址', data: urlPaths })
  let agileConfigRes
  const getConfig = async (index: number) => {
    console.info(`【agile】：接口请求地址：${urlPaths[index]}`)
    try {
      const response = await axios.get(urlPaths[index], {
        timeout: options.httptimeout || 100000,
        headers: {
          // @ts-ignore
          ...options.headers,
        },
      })
      if (options.debug) console.info({
        message: '【agile】获取配置原数据',
        data: response.data
      })
      agileConfigRes = transformConfig(response.data);
    } catch (err) {
      index = index + 1;
      if (index < urlPaths.length) {
        await getConfig(index);
      } else {
        console.error({
          url: `agile请求地址：${urlPaths}`,
          message: `【agile】警告：获取agile配置失败,appid: ${options.appid}`,
          error: err,
        })
        throw err;
      }
    }
  };
  await getConfig(0);
  return agileConfigRes
}


/**
 * 同步获取Agile配置
 * @returns {*}
 */
export function getAgileConfig() {
  if (!agileConfigCache) {
    try {
      agileConfigCache = fs.readJsonSync(path.resolve(__dirname, './agileConfig.json'))
    } catch (err) {}
    if (!agileConfigCache) {
      throw new Error('【agile】: 请确保agile初始化已完成！');
    }
  }
  return agileConfigCache.data;
}


