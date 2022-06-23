export interface Config {
  /** 应用id */
  appid: string;
  /** 应用的私钥 */
  secret: string;
  /** 服务端节点地址，多个节点的用逗号,分割 */
  nodes: string;
  /** 环境 */
  env: "DEV" | "TEST" | "STAGING" | "PROD";
  /** 连接客户端的自定义名称 */
  name?: string
  /** 连接客户端的自定义标签 */
  tag?: string
  /** http请求超时时间 */
  httptimeout?: number
  /** debug模式，打印更多信息 */
  debug?: boolean
  /** 头部 */
  headers: { Authorization: string; appid: string };
}

export interface Data {
  md5: string;
  data: any
}
