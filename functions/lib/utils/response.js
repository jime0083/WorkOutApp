"use strict";
/**
 * Cloud Functions レスポンスヘルパー
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
// 成功レスポンス作成
function successResponse(data) {
    return {
        success: true,
        data,
    };
}
// エラーレスポンス作成
function errorResponse(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
}
//# sourceMappingURL=response.js.map