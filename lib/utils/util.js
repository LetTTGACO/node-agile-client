"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformConfig = exports.generateMd5 = exports.getTime = exports.generateUrl = exports.shuffle = exports.randomNode = void 0;
var md5_1 = __importDefault(require("md5"));
/**
 * 从节点数组随机选择一个节点
 * @param nodes
 * @returns {*}
 */
function randomNode(nodes) {
    return nodes[Math.floor(Math.random() * nodes.length)];
}
exports.randomNode = randomNode;
/**
 * 数组乱序
 * @param nodes
 * @returns {*}
 */
function shuffle(nodes) {
    var _a;
    var m = nodes.length;
    while (m > 1) {
        var index = Math.floor(Math.random() * m--);
        _a = [nodes[index], nodes[m]], nodes[m] = _a[0], nodes[index] = _a[1];
    }
    return nodes;
}
exports.shuffle = shuffle;
/**
 * 生成url
 * @param options
 * @param isWs 是否生成wsUrl
 * @returns {string[]|*[]}
 */
function generateUrl(options, isWs) {
    var nodes = options.nodes, tag = options.tag, name = options.name, appid = options.appid, env = options.env;
    var urlList = shuffle(String(nodes).split(',').filter(function (item) { return !!item; }));
    if (isWs) {
        // ws连接
        return urlList.map(function (item) {
            if (item.startsWith('https:')) {
                item = item.replace('https:', 'wss:');
            }
            else {
                item = item.replace('http:', 'ws:');
            }
            return "".concat(item, "/ws?client_name=").concat(name, "&client_tag=").concat(tag);
        });
    }
    // api调用
    return urlList.map(function (item) {
        return "".concat(item, "/api/Config/app/").concat(appid, "?env=").concat(env);
    });
}
exports.generateUrl = generateUrl;
/**
 * 获取当前时间格式化
 * @returns {string}
 */
function getTime() {
    var date = new Date();
    var nowMonth = date.getMonth() + 1;
    var strDate = date.getDate();
    if (nowMonth >= 1 && nowMonth <= 9) {
        nowMonth = "0" + nowMonth;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return "".concat(date.getFullYear(), "-").concat(nowMonth, "-").concat(strDate, " ").concat(hour, ":").concat(minute, ":").concat(second);
}
exports.getTime = getTime;
/**
 * 生成md5
 * @param configs
 * @returns {string|*}
 */
function generateMd5(configs) {
    var keyStr = configs.map(function (item) { return "".concat(item.group, ":").concat(item.key); }).sort(function (a, b) { return a - b; }).join('&');
    var valueStr = configs.map(function (item) { return item.value; }).sort(function (a, b) { return a - b; }).join('&');
    var txt = "".concat(keyStr, "&").concat(valueStr);
    return (0, md5_1.default)(txt).toUpperCase();
}
exports.generateMd5 = generateMd5;
/**
 * 将[{key: abc, value: def}]转换为{abc: def}
 * @param configs
 */
function transformConfig(configs) {
    if (configs.length === 0) {
        return {
            data: {},
        };
    }
    var result = {
        data: {},
        md5: ''
    };
    configs.forEach(function (item) {
        result.data[item.key] = item.value;
    });
    result.md5 = generateMd5(configs);
    return result;
}
exports.transformConfig = transformConfig;
