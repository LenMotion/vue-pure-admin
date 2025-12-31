import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import type { UserResult } from "@/api/user";
import { login, type UserInfoData } from "@/api/system/auth";
import { useMultiTagsStoreHook } from "./multiTags";
import { useDictStoreHook } from "./dict";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 前端生成的验证码（按实际需求替换）
    verifyCode: "",
    // 判断登录页面显示哪个组件（0：登录（默认）、1：手机登录、2：二维码登录、3：注册、4：忘记密码）
    currentPage: 0,
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储前端生成的验证码 */
    SET_VERIFYCODE(verifyCode: string) {
      this.verifyCode = verifyCode;
    },
    /** 存储登录页面显示哪个组件 */
    SET_CURRENTPAGE(value: number) {
      this.currentPage = value;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        login(data)
          .then(response => {
            if (response?.code === 200 && response?.result) {
              const userInfo: UserInfoData = response.result;
              const tokenValue = userInfo.tokenValue || "";

              // 直接使用登录响应中的用户信息设置 token
              // expires 设置为 0，表示前端不处理 token 过期逻辑
              const tokenData: DataInfo<Date> = {
                accessToken: tokenValue,
                expires: new Date(0),
                username: userInfo.username || data.username || "",
                roles: userInfo.roles || [],
                permissions: userInfo.perms || [],
                avatar: userInfo.avatarUrl || "",
                nickname: userInfo.nickName || ""
              };
              setToken(tokenData);

              // 清空字典缓存
              useDictStoreHook().clearDictCache();

              // 转换为旧格式以保持兼容性
              resolve({
                success: true,
                data: {
                  accessToken: tokenValue,
                  refreshToken: "",
                  expires: tokenData.expires,
                  username: tokenData.username || "",
                  nickname: tokenData.nickname || "",
                  avatar: tokenData.avatar || "",
                  roles: tokenData.roles || [],
                  permissions: tokenData.permissions || []
                }
              });
            } else {
              resolve({
                success: false,
                data: {
                  accessToken: "",
                  refreshToken: "",
                  expires: new Date(),
                  username: "",
                  nickname: "",
                  avatar: "",
                  roles: [],
                  permissions: []
                }
              });
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 清除用户状态和 token 缓存 */
    clearUserInfo() {
      this.username = "";
      this.avatar = "";
      this.nickname = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.clearUserInfo();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
