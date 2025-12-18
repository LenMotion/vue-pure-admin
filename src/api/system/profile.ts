import { http } from "@/utils/http";
import type { ResponseResult } from "../model/type";

// 路由枚举
export enum RouteEnums {
  SYSTEM = 1,
  MONITOR = 2,
  PERMISSION = 3,
  FRAME = 4,
  TABS = 5
}

// 路由元信息类型
export interface RouterMeta {
  // 图标
  icon?: string;
  // 标题（支持多语言 key）
  title?: string;
  // 排序
  rank?: RouteEnums | number;
  // 角色权限
  roles?: string[];
  // 按钮权限
  auths?: string[];
  // 是否显示在菜单
  showLink?: boolean;
  // 高亮路径
  activePath?: string;
  // 是否保持页面活跃
  keepAlive?: boolean;
  // iframe 地址
  frameSrc?: string;
  // 组件路径（可选，用于动态导入）
  componentPath?: string;
  // 是否隐藏子菜单
  hideChildrenInMenu?: boolean;
  // 是否隐藏菜单
  hideInMenu?: boolean;
  // 菜单父级名称
  parentKey?: string;
  // 是否固定在标签页
  affix?: boolean;
}

export interface RouteItem {
  // 路由路径
  path: string;
  // 组件路径（相对于 src/views）
  component?: string;
  // 路由名称
  name?: string;
  // 重定向路径
  redirect?: string;
  // 元信息
  meta?: RouterMeta;
  // 子路由
  children?: RouteItem[];
  // 是否严格匹配
  caseSensitive?: boolean;
  // 是否结束匹配
  end?: boolean;
  // 别名
  alias?: string | string[];
}

export type RouteResult = ResponseResult<RouteItem[]>;

/**
 * 获取验证码
 */
export const getAsyncRoutes = () => {
  return http.request<RouteResult>("get", "/system/profile/get-async-routes");
};
