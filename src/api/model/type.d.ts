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
