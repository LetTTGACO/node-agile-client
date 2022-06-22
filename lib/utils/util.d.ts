import { Config } from "../types";
/**
 * 从节点数组随机选择一个节点
 * @param nodes
 * @returns {*}
 */
export declare function randomNode(nodes: string[]): string;
/**
 * 数组乱序
 * @param nodes
 * @returns {*}
 */
export declare function shuffle(nodes: string[]): string[];
/**
 * 生成url
 * @param options
 * @param isWs 是否生成wsUrl
 * @returns {string[]|*[]}
 */
export declare function generateUrl(options: Config, isWs: boolean): string[];
/**
 * 获取当前时间格式化
 * @returns {string}
 */
export declare function getTime(): string;
/**
 * 生成md5
 * @param configs
 * @returns {string|*}
 */
export declare function generateMd5(configs: any[]): string;
/**
 * 将[{key: abc, value: def}]转换为{abc: def}
 * @param configs
 */
export declare function transformConfig(configs: any[]): {
    data: any;
    md5: string;
} | {
    data: {};
};
