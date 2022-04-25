const { WebSocket } = require('ws');

class WS {
  constructor(socketUrl, option) {
    this.socketUrl = socketUrl
    this.option = {
      onOpenAutoSendMsg:"",
      heartTime: 30000, // 心跳时间间隔
      heartMsg: 'ping', // 心跳信息,默认为'ping'
      isReconnect: true, // 是否自动重连
      reconnectTime: 5000, // 重连时间间隔
      reconnectCount: -1, // 重连次数 -1 则不限制
      openCallback: null, // 连接成功的回调
      closeCallback: null, // 关闭的回调
      messageCallback: null, // 消息的回调
      errorCallback: null, // 错误的回调
      debug: false,  //是否打开debug模式
      ...option,
    }
    this.websocket = null
    this.sendPingInterval = null  //心跳定时器
    this.reconnectInterval = null  //重连定时器
    this.activeLink = true  //socket对象是否可用
    this.disconnect = false  //是否是服务端主动切断socket连接
    this.reconnectNum = 0 //重连次数限制
    this.init()
  }

  /**
   * 初始化
   */
  init() {
    Reflect.deleteProperty(this, this.websocket)
    this.websocket = new WebSocket(this.socketUrl, {
      ...this.option.wsOptions,
    })
    this.websocketOnOpen()
    this.websocketOnMessage()
    this.websocketOnError()
    this.websocketOnClose()
  }

  /**
   * 连接成功
   */
  websocketOnOpen(callback) {
    this.websocket.onopen = (event) => {
      if (this.option.debug) console.log('%c websocket链接成功', 'color:green')
      this.sendPing(this.option.heartTime, this.option.heartMsg);
      if(this.option.onOpenAutoSendMsg){
        this.send(this.option.onOpenAutoSendMsg)
      }
      if (typeof callback === 'function') {
        this.disconnect = false
        callback(event)
      } else {
        (typeof this.option.openCallback === 'function') && this.option.openCallback(event)
      }
    }
  }

  /**
   * 发送数据
   * @param message
   */
  send (message){
    if (this.websocket.readyState !== this.websocket.OPEN) {
      new Error('没有连接到服务器，无法发送消息')
      return
    }
    this.websocket.send(message)
  }

  /**
   * 触发接收消息事件
   * @param callback
   */
  websocketOnMessage(callback) {
    this.websocket.onmessage = (event) => {
      // 收到任何消息，重新开始倒计时心跳检测
      if (typeof callback === 'function') {
        callback(event.data)
      } else {
        (typeof this.option.messageCallback === 'function') && this.option.messageCallback(event.data)
      }
    }
  }

  /**
   * 连接错误
   * @param callback
   */
  websocketOnError(callback) {
    this.websocket.onerror = (event) => {
      if (this.option.debug) console.error('连接发生错误', event)
      if (typeof callback === 'function') {
        callback(event)
      } else {
        (typeof this.option.errorCallback === 'function') && this.option.errorCallback(event)
      }
    }
  }

  /**
   * 连接关闭
   */
  websocketOnClose(callback) {
    this.websocket.onclose = (event) => {
      if (this.option.debug) console.warn('socket连接关闭,关于原因:', event)
      clearInterval(this.sendPingInterval)
      clearInterval(this.reconnectInterval);
      if (this.activeLink && this.option.isReconnect) {
        this.onReconnect()
      } else {
        this.activeLink = false;
        if (this.option.debug) console.log('%c websocket链接完全关闭', 'color:green')
      }
      if (typeof callback === 'function') {
        callback(event)
      } else {
        (typeof this.option.closeCallback === 'function') && this.option.closeCallback(event)
      }
    }
  }

  /**
   * 连接事件
   */
  onReconnect() {
    if (this.option.debug) console.warn(`非正常关闭,${this.option.reconnectTime}毫秒后触发重连事件`)
    if (this.option.reconnectCount === -1 || this.option.reconnectCount > this.reconnectNum) {
      this.reconnectInterval = setTimeout(() => {
        this.reconnectNum++
        if (this.option.debug) console.warn(`正在准备第${this.reconnectNum}次重连`)
        this.init()
      }, this.option.reconnectTime)
    } else {
      this.activeLink = false;
      if (this.option.debug) console.warn(`已重连${this.reconnectNum}次仍然没有响应,取消重连`)
      clearInterval(this.reconnectInterval);
    }
  }

  /**
   * 移除socket并关闭
   */
  removeSocket(disconnect) {
    this.activeLink = false
    this.disconnect = disconnect
    this.websocket.close(1000)
  }


  /**
   * 心跳机制
   * @param time
   * @param ping
   */
  sendPing (time = 5000, ping = 'ping'){
    clearInterval(this.sendPingInterval);
    if (time === -1) return
    this.sendPingInterval = setInterval(() => {
      this.send(ping)
    }, time)
  }

  /**
   * 返回websocket实例
   * @returns {null}
   */
  getWebsocket() {
    return this.websocket
  }

  /**
   * 查看连接状态
   */
  getActiveLink() {
    return {
      activeLink: this.activeLink,
      disconnect: this.disconnect
    }
  }
}

exports.WS = WS
