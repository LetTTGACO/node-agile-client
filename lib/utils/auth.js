"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAuthorization = void 0;
/**
 * 生成Authorization头
 * @param options
 * @returns {{Authorization: string, appid}}
 */
function generateAuthorization(options) {
    var appid = options.appid, secret = options.secret;
    var str = "".concat(appid, ":").concat(secret);
    var buff = Buffer.from(str, 'utf-8');
    var data = buff.toString('base64');
    var Authorization = "Basic ".concat(data);
    return {
        appid: appid,
        Authorization: Authorization,
    };
}
exports.generateAuthorization = generateAuthorization;
