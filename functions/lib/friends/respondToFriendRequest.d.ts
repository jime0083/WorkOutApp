interface RespondToFriendRequestData {
    friendshipId: string;
    action: 'accept' | 'reject';
    lang?: string;
}
export declare const respondToFriendRequest: import("firebase-functions/v2/https").CallableFunction<RespondToFriendRequestData, any>;
export {};
//# sourceMappingURL=respondToFriendRequest.d.ts.map