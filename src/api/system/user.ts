import { http } from "@/utils/http";
import type {
  BaseMapResult,
  BasePageQuery,
  BasePageResult,
  ResponseResult,
  StatusUpdateRequest
} from "../model/type";

/**
 * 用户模型
 */
export interface UserModel extends BaseMapResult {
  /** 用户编码 */
  userCode?: string;
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickName?: string;
  /** 部门ID */
  deptId?: number;
  /** 部门名称 */
  deptName?: string;
  /** 岗位ID */
  postId?: number;
  /** 岗位名称 */
  postName?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号码 */
  phoneNumber?: string;
  /** 性别 */
  sex?: string;
  /** 生日 */
  birthday?: string;
  /** 头像 */
  avatar?: string;
  /** 民族 */
  nation?: string;
  /** 证件类型 */
  idType?: string;
  /** 身份证号 */
  idCard?: string;
  /** 文化程度 */
  cultureType?: string;
  /** 政治面貌 */
  politicalOutlook?: string;
  /** 地址 */
  address?: string;
  /** 入职日期 */
  entryDate?: string;
  /** 状态 */
  status?: string;
  /** 最后登录IP */
  loginIp?: string;
  /** 最后登录时间 */
  loginDate?: string;
  /** 备注 */
  remark?: string;
  /** 角色ID字符串 */
  roleIdStr?: string;
  /** 角色ID数组 */
  roleIds?: number[];
}

/**
 * 用户查询参数
 */
export interface UserQuery extends BasePageQuery {
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickName?: string;
  /** 部门ID */
  deptId?: number;
  /** 状态 */
  status?: string;
}

export type UserListResult = ResponseResult<BasePageResult<UserModel>>;

/** 获取用户管理-用户列表 */
export const getUserListApi = (params?: UserQuery) => {
  return http.request<UserListResult>("get", "/system/user/list", { params });
};

/** 保存或更新用户 */
export const saveOrUpdateUserApi = (data?: UserModel) => {
  return http.request<ResponseResult>("post", "/system/user", { data });
};

/** 删除用户 */
export const delUserApi = (id: number) => {
  return http.request<ResponseResult>("delete", "/system/user/" + id);
};

/** 更新状态 */
export const updateUserStatusApi = (data?: StatusUpdateRequest) => {
  return http.request<ResponseResult>("put", "/system/user/status", { data });
};
