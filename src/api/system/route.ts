import { http } from "@/utils/http";
import type { ResponseResult, BaseMapResult } from "../model/type";

/**
 * 路由信息
 */
export interface RouteModel extends BaseMapResult {
  /** 父路由ID */
  parentId?: number;
  /** 路由类型 0菜单 1iframe 2外链 3按钮 */
  routeType: number;
  /** 路由路径 */
  path?: string;
  /** 路由名称(必须唯一) */
  name?: string;
  /** 路由重定向地址 */
  redirect?: string;
  /** 组件路径 */
  component?: string;
  /** 菜单名称 */
  title: string;
  /** 菜单图标 */
  icon?: string;
  /** 菜单名称右侧的额外图标 */
  extraIcon?: string;
  /** 是否在菜单中显示(0:否, 1:是) */
  showLink?: boolean;
  /** 是否显示父级菜单(0:否, 1:是) */
  showParent?: boolean;
  /** 菜单排序 */
  rank?: number;
  /** 页面级别权限设置(JSON Array) */
  roles?: string;
  /** 按钮级别权限设置(JSON Array) */
  auths?: string;
  /** 是否缓存该路由页面(0:否, 1:是) */
  keepAlive?: boolean;
  /** 内嵌iframe链接地址 */
  frameSrc?: string;
  /** iframe是否开启首次加载动画(0:否, 1:是) */
  frameLoading?: boolean;
  /** 页面动画(Vue内置) */
  transitionName?: string;
  /** 进场动画(animate.css) */
  enterTransition?: string;
  /** 离场动画(animate.css) */
  leaveTransition?: string;
  /** 禁止添加到标签页(0:否, 1:是) */
  hiddenTag?: boolean;
  /** 标签页最大显示数量 */
  dynamicLevel?: number;
  /** 指定高亮的菜单路径 */
  activePath?: string;
  /** 备注 */
  remark?: string;
}

export interface RouteTree extends RouteModel {
  children: RouteTree[];
}

/**
 * 路由树响应结果
 */
export type RouteListResult = ResponseResult<RouteTree[]>;

/** 获取系统管理-路由管理-路由树 */
export const getRouteTreeApi = () => {
  return http.request<RouteListResult>("get", "/system/route/tree");
};

/** 保存或更新路由 */
export const saveOrUpdateRouteApi = (data?: RouteModel) => {
  return http.request<ResponseResult<boolean>>("post", "/system/route", {
    data
  });
};

/** 删除路由 */
export const delRouteApi = (id: number) => {
  return http.request<ResponseResult<boolean>>("delete", `/system/route/${id}`);
};
