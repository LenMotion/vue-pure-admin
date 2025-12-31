/**
 * 通用 API 响应结果类型
 * @template T - 响应数据的类型
 */
export interface ResponseResult<T = any> {
  /** 状态码，200 表示成功 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 响应数据 */
  result: T;
  /** 追踪 ID */
  traceId: string;
}

/**
 * 基础分页查询参数
 */
export interface BasePageQuery {
  /** 当前页数 */
  pageNum: number;
  /** 每页显示条目个数 */
  pageSize: number;
}

/**
 * 基础分页结果
 */
export interface BasePageResult<T = any> {
  /** 列表数据 */
  items: T[];
  /** 总条目数 */
  total: number;
  /** 当前页数 */
  page: number;
  /** 每页显示条目个数 */
  pageNum: number;
  /** 每页显示条目个数 */
  pageSize: number;
  /** 扩展数据 */
  extension: any;
}

/**
 * 基础映射结果
 */
export interface BaseMapResult {
  /** 角色ID */
  id: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建者 */
  createBy?: string;
  /** 更新者 */
  updateBy?: string;
  /** 翻译映射 */
  transMap?: Record<string, any>;
}

/**
 * 状态更新请求参数
 */
export interface StatusUpdateRequest {
  /** 主键ID */
  id: number;
  /** 状态（0正常 1停用） */
  status: string;
}
