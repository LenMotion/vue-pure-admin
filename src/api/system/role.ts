// /system/role/list

import { http } from "@/utils/http";
import type {
  BasePageQuery,
  BasePageResult,
  ResponseResult,
  BaseMapResult,
  StatusUpdateRequest
} from "../model/type";

/**
 * 角色信息
 */
export interface RoleModel extends BaseMapResult {
  /** 角色名称 */
  roleName: string;
  /** 角色权限字符串 */
  roleKey: string;
  /** 角色显示顺序 */
  roleSort: number;
  /** 数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限） */
  dataScope: string;
  /** 角色状态（0正常 1停用） */
  status: string;
  /** 备注 */
  remark: string;
}

/**
 * 角色列表查询参数
 */
export interface RoleListQuery extends BasePageQuery {
  roleName?: string;
  roleKey?: string;
  status?: string;
}

/**
 * 角色菜单请求参数
 */
export interface RoleMenuRequest {
  id: number;
  menuIds: string[];
  halfMenuIds: string[];
}

/**
 * 角色列表响应结果
 */
export type RoleListResult = ResponseResult<BasePageResult<RoleModel>>;

/** 获取角色管理-角色列表 */
export const getRoleListApi = (params?: RoleListQuery) => {
  return http.request<RoleListResult>("get", "/system/role/list", { params });
};

/** 更新角色状态 */
export const updateRoleStatusApi = (data?: StatusUpdateRequest) => {
  return http.request<ResponseResult>("put", "/system/role/status", { data });
};

/** 保存或更新角色 */
export const saveOrUpdateRoleApi = (data?: RoleModel) => {
  return http.request<ResponseResult>("post", "/system/role", { data });
};

/** 保存角色菜单 */
export const saveRoleMenuApi = (data?: RoleMenuRequest) => {
  return http.request<ResponseResult>("post", "/system/role/menu", { data });
};

/** 删除角色 */
export const delRoleApi = (id: number) => {
  return http.request<ResponseResult>("delete", "/system/role/" + id);
};

/** 角色菜单id列表响应结果 */
export interface RoleMenuIdListResponse {
  menuIds: string[];
  halfMenuIds: string[];
}

/** 获取角色菜单id列表 */
export const roleMenuIdListAPi = (roleId: number) => {
  return http.request<ResponseResult<RoleMenuIdListResponse>>(
    "get",
    "/system/role/menuIdList/" + roleId
  );
};
