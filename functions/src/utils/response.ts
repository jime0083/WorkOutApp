/**
 * Cloud Functions レスポンスヘルパー
 */

// 成功レスポンス型
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

// エラーレスポンス型
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// レスポンス型（ユニオン）
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// 成功レスポンス作成
export function successResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

// エラーレスポンス作成
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
