export interface Options {
  appid: string;
  secret: string;
  nodes: string[] | string;
  env: "DEV" | "TEST" | "STAGING" | "PROD";
}

export declare function init(options: Options): Promise<void>;

export declare function getAgileConfigAsync(options: Options): any

export declare function getAgileConfig(): any;
