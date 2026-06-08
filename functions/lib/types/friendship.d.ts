/**
 * 友達関係の型定義
 */
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export interface Friendship {
    id: string;
    requesterId: string;
    receiverId: string;
    status: FriendshipStatus;
    blockedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface FriendWithProfile {
    friendshipId: string;
    friendId: string;
    visibleUserId: string;
    nickname: string;
    profileImageUrl: string | null;
    isBlocked: boolean;
    blockedByMe: boolean;
}
export interface FriendRequest {
    friendshipId: string;
    requesterId: string;
    requesterProfile: {
        visibleUserId: string;
        nickname: string;
        profileImageUrl: string | null;
    };
    createdAt: Date;
}
export interface FriendRequestResult {
    success: boolean;
    friendshipId?: string;
    error?: string;
}
//# sourceMappingURL=friendship.d.ts.map