import { http } from "@/utils/http";
import type { ResponseResult } from "../model/type";

/**
 * 验证码数据
 */
export interface CaptchaData {
  /** 是否启用验证码 */
  captchaEnable: boolean;
  /** 验证码唯一标识 */
  uuid: string;
  /** 验证码图片（Base64 格式） */
  img: string;
}

/**
 * 验证码接口响应结果
 */
export type CaptchaResult = ResponseResult<CaptchaData>;

/**
 * 获取验证码
 */
export const getCaptcha = () => {
  return http.request<CaptchaResult>("get", "/auth/captchaImage");
};

/**
 * 登录请求参数
 */
export interface LoginBody {
  /** 用户名 */
  username: string;
  /** 用户密码 */
  password: string;
  /** 验证码 */
  code?: string;
  /** 唯一标识 */
  uuid?: string;
}

/**
 * 用户信息数据
 */
export interface UserInfoData {
  /** ID */
  id: number;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  /** 创建人 */
  createBy: string;
  /** 更新人 */
  updateBy: string;
  /** 用户编码 */
  userCode: string;
  /** 部门ID */
  deptId: number;
  /** 岗位ID */
  postId: number;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickName: string;
  /** 真实姓名 */
  realName: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  phoneNumber: string;
  /** 性别 */
  sex: string;
  /** 生日 */
  birthday: string;
  /** 头像URL */
  avatarUrl: string;
  /** 民族 */
  nation: string;
  /** 文化类型 */
  cultureType: string;
  /** 状态 */
  status: string;
  /** 地址 */
  address: string;
  /** 登录IP */
  loginIp: string;
  /** 登录日期 */
  loginDate: string;
  /** 快捷导航 */
  quickNav: Array<any>;
  /** 角色列表 */
  roles: Array<string>;
  /** 权限列表 */
  perms: Array<string>;
  /** 翻译映射 */
  transMap: Record<string, any>;
  /** 令牌值 */
  tokenValue?: string;
}

/**
 * 登录接口响应结果
 */
export type LoginResult = ResponseResult<UserInfoData>;

/**
 * 用户登录
 * @param data 登录参数
 */
export const login = (data: LoginBody) => {
  return http.request<LoginResult>("post", "/auth/login", {
    data
  });
};
