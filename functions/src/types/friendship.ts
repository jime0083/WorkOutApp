/**
 * 友達関係の型定義
 */

// 友達関係のステータス
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

// 友達関係
export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  blockedBy: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// 友達一覧表示用（相手のプロフィール情報を含む）
export interface FriendWithProfile {
  friendshipId: string;
  friendId: string;
  visibleUserId: string;
  nickname: string;
  profileImageUrl: string | null;
  isBlocked: boolean;
  blockedByMe: boolean;
}

// 友達申請一覧表示用
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

// 友達申請結果
export interface FriendRequestResult {
  success: boolean;
  friendshipId?: string;
  error?: string;
}
