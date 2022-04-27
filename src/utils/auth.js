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

exports.generateAuthorization = generateAuthorization;
