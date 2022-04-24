/**
 * 生成Authorization头
 * @param options
 * @returns {{Authorization: string, appid}}
 */
function generateAuthorization(options) {
  const { appid, secret } = options;
  const str = `${appid}:${secret}`;
  const buff = Buffer.from(str, 'utf-8');
  const data = buff.toString('base64');
  const Authorization = `Basic ${data}`;
  return {
    appid,
    Authorization,
  }
}

/**
 * 将[{key: abc, value: def}]转换为{abc: def}
 * @param config
 */
function transformConfig(config) {
  if (config.length === 0) {
    return {};
  }
  const result = {};
  config.forEach(item => {
    result[item.key] = item.value;
  });
  return result;
}

exports.generateAuthorization = generateAuthorization;
exports.transformConfig = transformConfig;
