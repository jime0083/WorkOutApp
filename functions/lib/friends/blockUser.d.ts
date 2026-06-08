interface BlockUserData {
    targetUserId: string;
    action: 'block' | 'unblock';
    lang?: string;
}
export declare const blockUser: import("firebase-functions/v2/https").CallableFunction<BlockUserData, any>;
export {};
//# sourceMappingURL=blockUser.d.ts.map