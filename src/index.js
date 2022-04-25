const fetch = require('node-fetch')
const path = require('path')
const fs = require('fs-extra')
// utils
const { generateAuthorization, transformConfig, getTime, generateUrl } = require('./utils')
const { WS } = require('./ws')
// const
const { WEBSOCKET_ACTION } = require('./const/ws')

// 配置缓存
let agileConfigCache

/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<void>}
 */
async function init(options) {
  const { appid, secret, env, nodes } = options
  if (!appid || !secret || !env || !nodes) {
    console.error({
      message: '【agile】初始化参数不完整！',
    });
    process.exit(-1);
  }
  const beginTime = Date.now();
  // 生成请求头
  options.headers = generateAuthorization(options)
  if (options.debug) console.log(options)
  // 初始化agile配置
  try {
    await initAgileConfig(options);
    console.info(`【agile】: 初始化agile服务成功，耗时: ${Date.now() - beginTime}ms。\r\n`);
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
async function initAgileConfig(options) {
  // websocket长连接
  getNotifications(options)
  await getAgileConfigAsync(options);
}



function getNotifications(options) {
  // 生成wsUrl
  const wsPaths = generateUrl(options, true)
  if (options.debug) console.log(wsPaths)

  function connect(index) {
    try {
      const ws = new WS(wsPaths[index], {
        wsOptions: {headers: options.headers},
      })
      ws.websocketOnOpen(() => {
        console.info(`【agile】: websocket连接成功，连接地址：${wsPaths[index]}`)
        getAgileConfigAsync(options, false).then(() => {
          console.info(`【agile】: 更新缓存成功, 更新时间：${getTime()}`)
        }).catch(err => {
          console.warn({
            message: '【agile】: 更新缓存失败，将会读取本地缓存',
            error: err
          });
          // NOTE 要不要考虑websocket连接成功但是http请求失败的情况
          // throw err
        })
      })
      ws.websocketOnMessage((data) => {
        if (options.debug) console.info('【agile】: 客户端收到消息' + data)
        // 服务端更新了
        if (data.indexOf("Action") !== -1) {
          const {Action} = JSON.parse(data)
          if (Action === WEBSOCKET_ACTION.RELOAD) {
            getAgileConfigAsync(options, false).then(() => {
              console.info(`【agile】: 更新缓存成功, 更新时间：${getTime()}`)
            }).catch(err => {
              console.warn({
                message: '【agile】: 更新缓存失败，将会读取本地缓存',
                error: err
              });
              // NOTE 要不要考虑websocket连接成功但是http请求失败的情况
              // throw err
            })
          }
          if (Action === WEBSOCKET_ACTION.OFFLINE) {
            console.warn('【agile】: 断开连接，将会读取本地缓存');
            ws.removeSocket(true)
          }
        }
      })
      ws.websocketOnError((err) => {
        console.warn({
          message: '【agile】: 连接发生错误，正在尝试重新连接...',
          error: err
        });
        throw err
      })
      ws.websocketOnClose(() => {
        if (!!ws.getActiveLink().disconnect){
          console.warn('【agile】: 服务端主动连接断开，将会读取本地缓存');
        }
      })
    } catch (err) {
      index = index + 1;
      if (index < wsPaths.length) {
        connect(index)
      } else {
        console.error({
          url: `【agile】请求地址：${wsPaths}`,
          message: `【agile】：websocket连接失败，将会读取本地缓存`,
          error: err,
        })
        throw err;
      }
    }
  }
  connect(0)
}


/**
 * 异步获取agile配置
 * @param options
 * @param useCache
 * @returns {Promise<*>}
 */
async function getAgileConfigAsync(options, useCache = true) {
  if (useCache) {
    // 优先从缓存中获取信息
    const beginTime = Date.now();
    const agileConfig = getAgileConfigFromCache(beginTime);
    if (agileConfig) {
      return agileConfig;
    }
  }
  // 从接口中获取
  try {
    const response = await getAgileConfigPromise(options);
    const data = await response.json();
    if (options.debug) console.log(`配置元数据：${data}`)
    agileConfigCache = transformConfig(data);
    if (options.debug) console.log(`配置JSON数据：${agileConfigCache}`)
    fs.writeJsonSync(path.resolve(__dirname, './agileConfig.json'), agileConfigCache);
    return agileConfigCache;
  } catch (err) {
    throw err;
  }
}


/**
 * 从缓存中获取agile配置
 * @param beginTime
 * @returns {*}
 */
function getAgileConfigFromCache(beginTime) {
  if (agileConfigCache) {
    return agileConfigCache;
  }
  try {
    const cacheFile = path.join(__dirname, './agileConfig.json');
    const isHave = !!fs.statSync(cacheFile).size;
    console.info('【agile】: 开始初始化agile配置(通过缓存获取)\r\n');
    if (isHave) {
      agileConfigCache = fs.readJsonSync(path.resolve(__dirname, './agileConfig.json'));
      if (agileConfigCache) {
        console.info(`【agile】: 初始化agile服务成功，耗时: ${Date.now() - beginTime}ms。\r\n`);
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
async function getAgileConfigPromise(options) {
  // 获取url
  const urlPaths = generateUrl(options, false);
  let agileConfigRes
  const getConfig = async (paths, index) => {
    try {
      agileConfigRes = await fetch(urlPaths[index], {
        method: 'GET',
        headers: {
          ...options.headers,
        },
      })
    } catch (err) {
      index = index + 1;
      if (index < paths.length) {
        await getConfig(paths, index);
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
  await getConfig(urlPaths, 0);
  return agileConfigRes
}


/**
 * 同步获取Agile配置
 * @returns {*}
 */
function getAgileConfig() {
  if (!agileConfigCache) {
    try {
      agileConfigCache = fs.readJsonSync(path.resolve(__dirname, './agileConfig.json'))
    } catch (err) {}
    if (!agileConfigCache) {
      throw new Error('【agile】: 请确保agile初始化已完成！');
    }
  }
  return agileConfigCache;
}

exports.init = init
exports.getAgileConfig = getAgileConfig



