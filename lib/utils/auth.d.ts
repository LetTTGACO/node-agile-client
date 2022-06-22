import { Config } from "../types";
/**
 * 生成Authorization头
 * @param options
 * @returns {{Authorization: string, appid}}
 */
export declare function generateAuthorization(options: Config): {
    appid: string;
    Authorization: string;
};
