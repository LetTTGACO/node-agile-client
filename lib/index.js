"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgileConfig = exports.init = void 0;
var axios_1 = __importDefault(require("axios"));
var path_1 = __importDefault(require("path"));
var fs_extra_1 = __importDefault(require("fs-extra"));
// utils
var utils_1 = require("./utils");
var ws_1 = require("./ws");
// const
var ws_2 = require("./const/ws");
// 配置缓存
var agileConfigCache;
/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<void>}
 */
function init(options) {
    return __awaiter(this, void 0, void 0, function () {
        var appid, secret, nodes, beginTime, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appid = options.appid, secret = options.secret, nodes = options.nodes;
                    if (options.debug)
                        console.info({ message: '【agile】传入参数：', data: options });
                    if (!appid || !secret || !nodes) {
                        console.error({
                            message: '【agile】初始化参数不完整！',
                        });
                        process.exit(-1);
                    }
                    beginTime = Date.now();
                    // 生成请求头
                    options.headers = (0, utils_1.generateAuthorization)(options);
                    if (options.debug)
                        console.info({ message: '【agile】请求头：', data: options.headers });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, initAgileConfig(options)];
                case 2:
                    _a.sent();
                    console.info("\u3010agile\u3011: \u521D\u59CB\u5316agile\u670D\u52A1\u6210\u529F\uFF0C\u8017\u65F6: ".concat(Date.now() - beginTime, "ms\u3002"));
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error({
                        message: '【agile】: 初始化agile失败',
                        error: err_1
                    });
                    // 退出进程
                    process.exit(-1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.init = init;
/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<*|undefined>}
 */
function initAgileConfig(options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // websocket长连接
                    getNotifications(options);
                    return [4 /*yield*/, getAgileConfigAsync(options, true)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * websocket连接
 * @param options
 */
function getNotifications(options) {
    // 生成wsUrl
    var wsPaths = (0, utils_1.generateUrl)(options, true);
    if (options.debug)
        console.info({ message: '【agile】：websocket所有请求地址', data: wsPaths });
    function connect(index) {
        try {
            var ws_3 = new ws_1.WS(wsPaths[index], {
                debug: !!options.debug,
                wsOptions: { headers: options.headers },
            });
            ws_3.websocketOnOpen(function () {
                console.info("\u3010agile\u3011: websocket\u8FDE\u63A5\u6210\u529F\uFF0C\u8FDE\u63A5\u5730\u5740\uFF1A".concat(wsPaths[index]));
            });
            ws_3.websocketOnMessage(function (data) {
                if (options.debug)
                    console.info('【agile】：客户端收到消息：' + data);
                if (data.indexOf("Action") !== -1) {
                    // 服务端更新了
                    var action = JSON.parse(data).Action;
                    if (action === ws_2.WEBSOCKET_ACTION.RELOAD) {
                        getAgileConfigAsync(options, false).catch();
                    }
                    if (action === ws_2.WEBSOCKET_ACTION.OFFLINE) {
                        ws_3.removeSocket();
                    }
                }
                else if (data !== '0' && data.startsWith('V:')) {
                    if (options.debug) {
                        console.info('【agile】: 服务端的MD5：' + data.slice(2));
                        console.info('【agile】: 缓存中的MD5：' + agileConfigCache.md5);
                    }
                    // 心跳检测时/服务端主动关闭连接时，同步配置
                    if (data.slice(2) !== agileConfigCache.md5) {
                        console.info('【agile】: 配置更新，即将重新读取配置');
                        getAgileConfigAsync(options, false).catch();
                    }
                }
            });
            ws_3.websocketOnError(function (err) {
                console.warn({
                    message: '【agile】: websocket连接发生错误，正在尝试重新连接...',
                    error: err
                });
                throw err;
            });
            ws_3.websocketOnClose(function () {
                console.warn('【agile】: websocket断开连接，将会读取本地缓存');
            });
        }
        catch (err) {
            index = index + 1;
            if (index < wsPaths.length) {
                connect(index);
            }
            else {
                console.error({
                    url: "\u3010agile\u3011\uFF1A\u8BF7\u6C42\u5730\u5740\uFF1A".concat(wsPaths),
                    message: "\u3010agile\u3011\uFF1Awebsocket\u8FDE\u63A5\u5931\u8D25\uFF0C\u5C06\u4F1A\u8BFB\u53D6\u672C\u5730\u7F13\u5B58",
                    error: err,
                });
            }
        }
    }
    connect(0);
}
/**
 * 异步获取agile配置
 * @param options
 * @param useCache 是否使用缓存
 * @returns {Promise<*>}
 */
function getAgileConfigAsync(options, useCache) {
    return __awaiter(this, void 0, void 0, function () {
        var agileConfig, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (useCache) {
                        agileConfig = getAgileConfigFromCache();
                        if (agileConfig) {
                            return [2 /*return*/, agileConfig];
                        }
                        console.info('【agile】: 开始初始化agile配置(通过接口获取)');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getAgileConfigPromise(options)];
                case 2:
                    agileConfigCache = _a.sent();
                    if (options.debug)
                        console.info({
                            message: '【agile】：JSON数据',
                            data: agileConfigCache
                        });
                    fs_extra_1.default.writeJsonSync(path_1.default.resolve(__dirname, './agileConfig.json'), agileConfigCache);
                    console.info("\u3010agile\u3011: \u66F4\u65B0\u7F13\u5B58\u6210\u529F, \u66F4\u65B0\u65F6\u95F4\uFF1A".concat((0, utils_1.getTime)()));
                    return [2 /*return*/, agileConfigCache];
                case 3:
                    err_2 = _a.sent();
                    console.warn({
                        message: '【agile】: 更新缓存失败，将会读取本地缓存',
                        error: err_2
                    });
                    throw err_2;
                case 4: return [2 /*return*/];
            }
        });
    });
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
        var cacheFile = path_1.default.join(__dirname, './agileConfig.json');
        var isHave = !!fs_extra_1.default.statSync(cacheFile).size;
        console.info('【agile】: 开始初始化agile配置(通过缓存获取)');
        if (isHave) {
            agileConfigCache = fs_extra_1.default.readJsonSync(path_1.default.resolve(__dirname, './agileConfig.json'));
            if (agileConfigCache) {
                return agileConfigCache;
            }
        }
    }
    catch (err) { }
    return agileConfigCache;
}
/**
 * 从agile中获取配置并写入缓存
 * @param options
 * @returns {Promise<*>}
 */
function getAgileConfigPromise(options) {
    return __awaiter(this, void 0, void 0, function () {
        var urlPaths, agileConfigRes, getConfig;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    urlPaths = (0, utils_1.generateUrl)(options, false);
                    if (options.debug)
                        console.info({ message: '【agile】所有接口请求地址', data: urlPaths });
                    getConfig = function (index) { return __awaiter(_this, void 0, void 0, function () {
                        var response, err_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.info("\u3010agile\u3011\uFF1A\u63A5\u53E3\u8BF7\u6C42\u5730\u5740\uFF1A".concat(urlPaths[index]));
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 7]);
                                    return [4 /*yield*/, axios_1.default.get(urlPaths[index], {
                                            timeout: options.httptimeout || 100000,
                                            headers: __assign({}, options.headers),
                                        })];
                                case 2:
                                    response = _a.sent();
                                    if (options.debug)
                                        console.info({
                                            message: '【agile】获取配置原数据',
                                            data: response.data
                                        });
                                    agileConfigRes = (0, utils_1.transformConfig)(response.data);
                                    return [3 /*break*/, 7];
                                case 3:
                                    err_3 = _a.sent();
                                    index = index + 1;
                                    if (!(index < urlPaths.length)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, getConfig(index)];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    console.error({
                                        url: "agile\u8BF7\u6C42\u5730\u5740\uFF1A".concat(urlPaths),
                                        message: "\u3010agile\u3011\u8B66\u544A\uFF1A\u83B7\u53D6agile\u914D\u7F6E\u5931\u8D25,appid: ".concat(options.appid),
                                        error: err_3,
                                    });
                                    throw err_3;
                                case 6: return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, getConfig(0)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, agileConfigRes];
            }
        });
    });
}
/**
 * 同步获取Agile配置
 * @returns {*}
 */
function getAgileConfig() {
    if (!agileConfigCache) {
        try {
            agileConfigCache = fs_extra_1.default.readJsonSync(path_1.default.resolve(__dirname, './agileConfig.json'));
        }
        catch (err) { }
        if (!agileConfigCache) {
            throw new Error('【agile】: 请确保agile初始化已完成！');
        }
    }
    return agileConfigCache.data;
}
exports.getAgileConfig = getAgileConfig;
