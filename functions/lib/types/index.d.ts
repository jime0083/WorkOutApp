/**
 * 型定義のエクスポート
 */
export type { SubscriptionStatus, SubscriptionPlan, User, CreateUserInput, UpdateUserInput, UserProfile, } from './user';
export type { MessageType, Message, CreateMessageInput, SendMessageResult, } from './message';
export type { LastMessage, UnreadCount, Conversation, ConversationWithProfile, } from './conversation';
export type { FriendshipStatus, Friendship, FriendWithProfile, FriendRequest, FriendRequestResult, } from './friendship';
export type { PlanType, Subscription, PurchaseSubscriptionInput, PurchaseSubscriptionResult, SubscriptionPricing, FreePlanLimits, PremiumFeatures, } from './subscription';
export { AUTH_ERRORS, MESSAGE_ERRORS, FRIENDSHIP_ERRORS, SUBSCRIPTION_ERRORS, STORAGE_ERRORS, ERROR_MESSAGES, } from './errors';
export type { AuthErrorCode, MessageErrorCode, FriendshipErrorCode, SubscriptionErrorCode, StorageErrorCode, AppErrorCode, AppError, } from './errors';
//# sourceMappingURL=index.d.ts.map