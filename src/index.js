const axios = require('axios')
const path = require('path')
const fs = require('fs-extra')
// utils
const { generateAuthorization, transformConfig } = require('./utils/auth')

// 配置缓存
let agileConfigCache

/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<void>}
 */
async function init(options) {
  const {appid, secret, env, nodes} = options
  if (!appid || !secret || !env || !nodes) {
    console.error({
      message: '初始化参数不完整！',
    });
    process.exit(-1);
  }
  const beginTime = Date.now();
  // 设置请求头
  axios.interceptors.request.use(config => {
    const headers = generateAuthorization(options)
    config.headers = {...config.headers, ...headers}
    return config;
  });
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
  // TODO websocket长连接
  await getAgileConfigAsync(options);
}

/**
 * 异步获取agile配置
 * @param options
 * @returns {Promise<*>}
 */
async function getAgileConfigAsync(options) {
  // 优先从缓存中获取信息
  const beginTime = Date.now();
  const agileConfig = getAgileConfigFromCache(beginTime);
  if (agileConfig) {
    return agileConfig;
  }
  // 从接口中获取
  try {
    const res = await getAgileConfigPromise(options);
    agileConfigCache = transformConfig(res.data);
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
  const { nodes, appid, env } = options
  // 节点url地址
  let urlPaths = []
  let agileConfigRes
  // 适配多节点
  if (Array.isArray(nodes)) {
    urlPaths = nodes.map(item => `${item}/api/Config/app/${appid}?env=${env}`)
  } else {
    urlPaths = [`${nodes}/api/Config/app/${appid}?env=${env}`]
  }
  const getConfig = async (paths, index) => {
    try {
      agileConfigRes = await axios.get(urlPaths[index])
    } catch (err) {
      index = index + 1;
      if (index < paths.length) {
        await getConfig(paths, index);
      } else {
        console.error({
          url: `agile请求地址：${urlPaths}`,
          message: `【agile】警告：获取agile配置失败,appid: ${appid}`,
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



