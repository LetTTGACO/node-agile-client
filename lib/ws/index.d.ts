export declare class WS {
    private readonly socketUrl;
    private option;
    private websocket;
    private sendPingInterval;
    private reconnectInterval;
    private activeLink;
    private reconnectNum;
    constructor(socketUrl: string, option: any);
    /**
     * 初始化
     */
    init(): void;
    /**
     * 连接成功
     */
    websocketOnOpen(callback: any): void;
    /**
     * 发送数据
     * @param message
     */
    send(message: string): void;
    /**
     * 触发接收消息事件
     * @param callback
     */
    websocketOnMessage(callback: any): void;
    /**
     * 连接错误
     * @param callback
     */
    websocketOnError(callback: any): void;
    /**
     * 连接关闭
     */
    websocketOnClose(callback: any): void;
    /**
     * 连接事件
     */
    onReconnect(): void;
    /**
     * 移除socket并关闭
     */
    removeSocket(): void;
    /**
     * 心跳机制
     * @param time
     * @param ping
     */
    sendPing(time?: number, ping?: string): void;
    /**
     * 返回websocket实例
     * @returns {null}
     */
    getWebsocket(): any;
    /**
     * 查看连接状态
     */
    getActiveLink(): boolean;
}
