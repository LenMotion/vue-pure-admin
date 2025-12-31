import { http } from "@/utils/http";
import type {
  BaseMapResult,
  BasePageQuery,
  BasePageResult,
  ResponseResult,
  StatusUpdateRequest
} from "../model/type";

/**
 * 字典类型模型
 */
export interface DictTypeModel extends BaseMapResult {
  /** 字典类型 */
  dictType: string;
  /** 字典名称 */
  dictName: string;
  /** 字典Key */
  dictKey: string;
  /** 状态（0正常 1停用） */
  status: string;
  /** 备注 */
  remark?: string;
}

/**
 * 字典数据模型
 */
export interface DictDataModel extends BaseMapResult {
  /** 字典Key */
  dictKey: string;
  /** 字典标签 */
  dictLabel: string;
  /** 字典键值 */
  dictValue: string;
  /** 字典排序 */
  dictSort: number;
  /** 表格字典样式 */
  listClass?: string;
  /** 状态（0正常 1停用） */
  status: string;
  /** 备注 */
  remark?: string;
}

/**
 * 字典类型查询参数
 */
export interface DictTypeQuery extends BasePageQuery {
  /** 字典类型 */
  dictType?: string;
  /** 字典名称 */
  dictName?: string;
  /** 字典Key */
  dictKey?: string;
  /** 状态（0正常 1停用） */
  status?: string;
}

/**
 * 字典类型列表响应结果
 */
export type DictTypeListResult = ResponseResult<BasePageResult<DictTypeModel>>;

/** 获取字典类型列表 */
export const getDictTypeListApi = (params?: DictTypeQuery) => {
  return http.request<DictTypeListResult>("get", "/system/dictType/list", {
    params
  });
};

/** 保存或更新字典类型 */
export const saveOrUpdateDictTypeApi = (data?: DictTypeModel) => {
  return http.request<ResponseResult>("post", "/system/dictType", { data });
};

/** 删除字典类型 */
export const delDictTypeApi = (id: number) => {
  return http.request<ResponseResult>("delete", "/system/dictType/" + id);
};

/** 更新字典类型状态 */
export const updateDictTypeStatusApi = (data?: StatusUpdateRequest) => {
  return http.request<ResponseResult>("put", "/system/dictType/status", {
    data
  });
};

/**
 * 字典数据查询参数
 */
export interface DictDataQuery extends BasePageQuery {
  /** 字典Key */
  dictKey?: string;
  /** 字典标签 */
  dictLabel?: string;
  /** 字典键值 */
  dictValue?: string;
  /** 状态（0正常 1停用） */
  status?: string;
}

/**
 * 字典数据列表响应结果
 */
export type DictDataListResult = ResponseResult<BasePageResult<DictDataModel>>;

/** 获取字典数据列表 */
export const getDictDataListApi = (params?: DictDataQuery) => {
  return http.request<DictDataListResult>("get", "/system/dictData/list", {
    params
  });
};

/** 保存或更新字典数据 */
export const saveOrUpdateDictDataApi = (data?: DictDataModel) => {
  return http.request<ResponseResult>("post", "/system/dictData", { data });
};

/** 删除字典数据 */
export const delDictDataApi = (id: number) => {
  return http.request<ResponseResult>("delete", "/system/dictData/" + id);
};

/** 更新字典数据状态 */
export const updateDictDataStatusApi = (data?: StatusUpdateRequest) => {
  return http.request<ResponseResult>("put", "/system/dictData/status", {
    data
  });
};
