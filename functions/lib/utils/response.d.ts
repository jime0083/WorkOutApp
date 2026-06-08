/**
 * Cloud Functions レスポンスヘルパー
 */
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
}
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
export declare function successResponse<T>(data: T): SuccessResponse<T>;
export declare function errorResponse(code: string, message: string, details?: Record<string, unknown>): ErrorResponse;
//# sourceMappingURL=response.d.ts.map