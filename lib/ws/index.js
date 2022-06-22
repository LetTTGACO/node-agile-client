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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS = void 0;
var ws_1 = require("ws");
var WS = /** @class */ (function () {
    function WS(socketUrl, option) {
        this.socketUrl = socketUrl;
        this.option = __assign({ onOpenAutoSendMsg: "", heartTime: 30000, heartMsg: 'ping', isReconnect: true, reconnectTime: 5000, reconnectCount: -1, openCallback: null, closeCallback: null, messageCallback: null, errorCallback: null, debug: false }, option);
        this.websocket = null;
        this.sendPingInterval = null; //心跳定时器
        this.reconnectInterval = null; //重连定时器
        this.activeLink = true; //socket对象是否可用
        this.reconnectNum = 0; //重连次数限制
        this.init();
    }
    /**
     * 初始化
     */
    WS.prototype.init = function () {
        Reflect.deleteProperty(this, this.websocket);
        this.websocket = new ws_1.WebSocket(this.socketUrl, __assign({}, this.option.wsOptions));
        this.websocketOnOpen(null);
        this.websocketOnMessage(null);
        this.websocketOnError(null);
        this.websocketOnClose(null);
    };
    /**
     * 连接成功
     */
    WS.prototype.websocketOnOpen = function (callback) {
        var _this = this;
        this.websocket.onopen = function (event) {
            if (_this.option.debug)
                console.log('%c websocket链接成功', 'color:green');
            _this.sendPing(_this.option.heartTime, _this.option.heartMsg);
            if (_this.option.onOpenAutoSendMsg) {
                _this.send(_this.option.onOpenAutoSendMsg);
            }
            if (typeof callback === 'function') {
                callback(event);
            }
            else {
                (typeof _this.option.openCallback === 'function') && _this.option.openCallback(event);
            }
        };
    };
    /**
     * 发送数据
     * @param message
     */
    WS.prototype.send = function (message) {
        if (this.websocket.readyState !== this.websocket.OPEN) {
            new Error('没有连接到服务器，无法发送消息');
            return;
        }
        this.websocket.send(message);
    };
    /**
     * 触发接收消息事件
     * @param callback
     */
    WS.prototype.websocketOnMessage = function (callback) {
        var _this = this;
        this.websocket.onmessage = function (event) {
            // 收到任何消息，重新开始倒计时心跳检测
            if (typeof callback === 'function') {
                callback(event.data);
            }
            else {
                (typeof _this.option.messageCallback === 'function') && _this.option.messageCallback(event.data);
            }
        };
    };
    /**
     * 连接错误
     * @param callback
     */
    WS.prototype.websocketOnError = function (callback) {
        var _this = this;
        this.websocket.onerror = function (event) {
            if (_this.option.debug)
                console.error('连接发生错误', event);
            if (typeof callback === 'function') {
                callback(event);
            }
            else {
                (typeof _this.option.errorCallback === 'function') && _this.option.errorCallback(event);
            }
        };
    };
    /**
     * 连接关闭
     */
    WS.prototype.websocketOnClose = function (callback) {
        var _this = this;
        this.websocket.onclose = function (event) {
            if (_this.option.debug)
                console.warn('socket连接关闭,关于原因:', event);
            clearInterval(_this.sendPingInterval);
            clearInterval(_this.reconnectInterval);
            if (_this.activeLink && _this.option.isReconnect) {
                _this.onReconnect();
            }
            else {
                _this.activeLink = false;
                if (_this.option.debug)
                    console.log('%c websocket链接完全关闭', 'color:green');
            }
            if (typeof callback === 'function') {
                callback(event);
            }
            else {
                (typeof _this.option.closeCallback === 'function') && _this.option.closeCallback(event);
            }
        };
    };
    /**
     * 连接事件
     */
    WS.prototype.onReconnect = function () {
        var _this = this;
        if (this.option.debug)
            console.warn("\u975E\u6B63\u5E38\u5173\u95ED,".concat(this.option.reconnectTime, "\u6BEB\u79D2\u540E\u89E6\u53D1\u91CD\u8FDE\u4E8B\u4EF6"));
        if (this.option.reconnectCount === -1 || this.option.reconnectCount > this.reconnectNum) {
            this.reconnectInterval = setTimeout(function () {
                _this.reconnectNum++;
                if (_this.option.debug)
                    console.warn("\u6B63\u5728\u51C6\u5907\u7B2C".concat(_this.reconnectNum, "\u6B21\u91CD\u8FDE"));
                _this.init();
            }, this.option.reconnectTime);
        }
        else {
            this.activeLink = false;
            if (this.option.debug)
                console.warn("\u5DF2\u91CD\u8FDE".concat(this.reconnectNum, "\u6B21\u4ECD\u7136\u6CA1\u6709\u54CD\u5E94,\u53D6\u6D88\u91CD\u8FDE"));
            clearInterval(this.reconnectInterval);
        }
    };
    /**
     * 移除socket并关闭
     */
    WS.prototype.removeSocket = function () {
        this.activeLink = false;
        this.websocket.close(1000);
    };
    /**
     * 心跳机制
     * @param time
     * @param ping
     */
    WS.prototype.sendPing = function (time, ping) {
        var _this = this;
        if (time === void 0) { time = 5000; }
        if (ping === void 0) { ping = 'ping'; }
        clearInterval(this.sendPingInterval);
        if (time === -1)
            return;
        this.send(ping);
        this.sendPingInterval = setInterval(function () {
            _this.send(ping);
        }, time);
    };
    /**
     * 返回websocket实例
     * @returns {null}
     */
    WS.prototype.getWebsocket = function () {
        return this.websocket;
    };
    /**
     * 查看连接状态
     */
    WS.prototype.getActiveLink = function () {
        return this.activeLink;
    };
    return WS;
}());
exports.WS = WS;
