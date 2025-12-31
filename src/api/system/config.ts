import { http } from "@/utils/http";
import type {
  BaseMapResult,
  BasePageQuery,
  BasePageResult,
  ResponseResult
} from "../model/type";

export interface ConfigModel extends BaseMapResult {
  /** 配置名称 */
  configName: string;
  /** 配置键名 */
  configKey: string;
  /** 配置键值 */
  configValue: string;
  /** 是否系统内置 */
  systemConfig: boolean;
  /** 备注 */
  remark: string;
}

export type SystemConfigResult = ResponseResult<any>;

export const getSystemConfigApi = () => {
  return http.request<SystemConfigResult>("get", "/system/config/systemConfig");
};

export type SystemConfigListResult = ResponseResult<
  BasePageResult<ConfigModel>
>;

export const getSystemConfigListApi = (params: BasePageQuery) => {
  return http.request<SystemConfigListResult>("get", "/system/config/list", {
    params
  });
};
