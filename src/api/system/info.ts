import { http } from "@/utils/http";
import type { ResponseResult } from "../model/type";

/**
 * 文件模型
 */
export interface FileModel {
  /** 文件唯一标识 */
  uid: string;
  /** 文件访问地址，用于后台保存 */
  url: string;
  /** 文件实际名称 */
  name: string;
  /** 文件扩展名 */
  ext: string;
  /** 文件大小 */
  size: number;
  /** 文件类型 */
  contentType: string;
  /** 翻译映射 */
  transMap?: Record<string, any>;
}

/** 获取文件信息 */
export const getFileInfoApi = (ids: string) => {
  return http.request<ResponseResult<FileModel[]>>(
    "get",
    `/system/fileInfo/${ids}`
  );
};

// /system/upload/file
export const uploadFileApi = (file: FormData) => {
  return http.request<ResponseResult<FileModel>>(
    "post",
    `/system/upload/file`,
    { data: file }
  );
};
