/**
 * 入力バリデーションヘルパー
 */
export declare function requireString(value: unknown, fieldName: string): asserts value is string;
export declare function optionalString(value: unknown, fieldName: string): string | undefined;
export declare function requireNumber(value: unknown, fieldName: string): asserts value is number;
export declare function requireBoolean(value: unknown, fieldName: string): asserts value is boolean;
export declare function requireArray<T>(value: unknown, fieldName: string): asserts value is T[];
export declare function validateEmail(email: string): boolean;
export declare function validateVisibleUserId(userId: string): boolean;
export declare function validatePassword(password: string): {
    valid: boolean;
    message?: string;
};
export declare function validateNickname(nickname: string): {
    valid: boolean;
    message?: string;
};
export declare function requireAuth(auth: {
    uid: string;
} | undefined): string;
//# sourceMappingURL=validators.d.ts.map