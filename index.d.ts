export interface Options {
  /** 应用id */
  appid: string;
  /** 应用的私钥 */
  secret: string;
  /** 服务端节点地址，多个节点的话就填写多个 */
  nodes: string[] | string;
  /** 环境 */
  env: "DEV" | "TEST" | "STAGING" | "PROD";
}

export declare function init(options: Options): Promise<void>;

export declare function getAgileConfigAsync(options: Options): any

export declare function getAgileConfig(): any;
