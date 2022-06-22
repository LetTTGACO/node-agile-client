import { Config } from "./types";
/**
 * 初始化agile配置
 * @param options
 * @returns {Promise<void>}
 */
export declare function init(options: Config): Promise<void>;
/**
 * 同步获取Agile配置
 * @returns {*}
 */
export declare function getAgileConfig(): any;
