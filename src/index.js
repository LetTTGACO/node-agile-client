const axios = require('axios')
const path = require('path')
const fs = require('fs-extra')
// utils
const {generateAuthorization} = require('./utils/auth')

// 配置缓存
let agileConfigCache

/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<void>}
 */
async function init(options) {
  const {appid, secret} = options
  if (!appid || !secret) {
    console.error({
      message: '必要参数不能为空',
    });
    process.exit(-1);
  }
  const beginTime = Date.now();
  // 设置请求头
  axios.interceptors.request.use(config => {
    if (appid && secret) {
      const headers = generateAuthorization(options)
      config.headers = {...config.headers, ...headers}
    }
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
    agileConfigCache = res.data[0];
    fs.writeJsonSync(path.resolve(__dirname, './agileConfig.json'), agileConfigCache);
    return agileConfigCache;
  } catch (err) {
    const resStatus = err.response && err.response.status;
    if (resStatus === 401) {
      throw new Error(`Unauthorized Agile config for: ${options.appid}`);
    }
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
  } catch (err) {
  }

  return agileConfigCache;
}

/**
 * 从agile中获取配置并写入缓存
 * @param options
 * @returns {Promise<*>}
 */
function getAgileConfigPromise(options) {
  const {nodes, appid, env} = options
  let node
  if (Array.isArray(nodes)) {
    // TODO: 支持多个节点
    node = nodes[0]
  } else {
    node = nodes
  }
  const url = `${node}/api/Config/app/${appid}?env=${env}`
  return axios.get(url).catch((err) => {
    let str = '';
    const resStatus = err.response && err.response.status;
    if (resStatus === 401) {
      str = '请求无权限'
      console.error({
        url: `agile请求地址：${url}`,
        message: `【agile】警告：获取agile配置失败,${str},appid: ${appid}`,
        error: err,
      })
    } else if (resStatus === 404) {
      str = 'agile地址不存在或者未发布'
      console.error({
        url: `agile请求地址：${url}`,
        message: `【agile】警告：获取agile配置失败,${str}, axios请求发生错误，请再次尝试启动`,
        error: err,
      })
    }
    console.error({
      url: `agile请求地址：${url}`,
      message: `【agile】警告：获取agile配置失败,${str},appid: ${appid}`,
      error: err,
    })
    throw err;
  });
}


/**
 * 同步获取Agile配置
 * @returns {*}
 */
function getAgileConfig() {
  if (!agileConfigCache) {
    try {
      agileConfigCache = fs.readJsonSync(path.resolve(__dirname, './agileConfig.json'))
    } catch (err) {
    }
    if (!agileConfigCache) {
      throw new Error('【agile】: 请确保agile初始化已完成！');
    }
  }
  return agileConfigCache;
}

exports.init = init
exports.getAgileConfig = getAgileConfig



