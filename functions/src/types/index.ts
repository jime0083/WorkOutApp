/**
 * 型定義のエクスポート
 */

// User
export type {
  SubscriptionStatus,
  SubscriptionPlan,
  User,
  CreateUserInput,
  UpdateUserInput,
  UserProfile,
} from './user';

// Message
export type {
  MessageType,
  Message,
  CreateMessageInput,
  SendMessageResult,
} from './message';

// Conversation
export type {
  LastMessage,
  UnreadCount,
  Conversation,
  ConversationWithProfile,
} from './conversation';

// Friendship
export type {
  FriendshipStatus,
  Friendship,
  FriendWithProfile,
  FriendRequest,
  FriendRequestResult,
} from './friendship';

// Subscription
export type {
  PlanType,
  Subscription,
  PurchaseSubscriptionInput,
  PurchaseSubscriptionResult,
  SubscriptionPricing,
  FreePlanLimits,
  PremiumFeatures,
} from './subscription';

// Errors
export {
  AUTH_ERRORS,
  MESSAGE_ERRORS,
  FRIENDSHIP_ERRORS,
  SUBSCRIPTION_ERRORS,
  STORAGE_ERRORS,
  ERROR_MESSAGES,
} from './errors';

export type {
  AuthErrorCode,
  MessageErrorCode,
  FriendshipErrorCode,
  SubscriptionErrorCode,
  StorageErrorCode,
  AppErrorCode,
  AppError,
} from './errors';
