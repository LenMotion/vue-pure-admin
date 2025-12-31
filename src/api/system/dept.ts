import { http } from "@/utils/http";
import type {
  BaseMapResult,
  BasePageQuery,
  ResponseResult,
  StatusUpdateRequest
} from "../model/type";

export interface DeptModel extends BaseMapResult {
  /** 父部门id */
  parentId?: number;
  /** 等级 */
  level?: number;
  /** 祖级列表 */
  ancestors?: string;
  /** 部门名称 */
  deptName: string;
  /** 简称 */
  shortName?: string;
  /** 单位编号 */
  deptCode?: string;
  /** 显示顺序 */
  orderNum: number;
  /** 负责人 */
  leader?: string;
  /** 联系电话 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 部门状态（0正常 1停用） */
  status: string;
  /** 备注 */
  remark?: string;
}

export interface DeptQuery extends BasePageQuery {
  /** 部门名称 */
  deptName: string;
  /** 单位编号 */
  deptCode?: string;
}

export type DeptListResult = ResponseResult<DeptModel[]>;

/** 获取部门管理-部门列表 */
export const getDeptListApi = (params?: DeptQuery) => {
  return http.request<DeptListResult>("get", "/system/dept/tree", { params });
};

/** 保存或更新部门 */
export const saveOrUpdateDeptApi = (data?: DeptModel) => {
  return http.request<ResponseResult>("post", "/system/dept", { data });
};

/** 删除部门 */
export const delDeptApi = (id: number) => {
  return http.request<ResponseResult>("delete", "/system/dept/" + id);
};

/** 更新状态 */
export const updateDeptStatusApi = (data?: StatusUpdateRequest) => {
  return http.request<ResponseResult>("put", "/system/dept/status", { data });
};
