/**
 * ユーティリティのエクスポート
 */

// Firebase
export { db, auth, storage, messaging, admin } from './firebase';

// Errors
export {
  AppError,
  AppErrorCode,
  handleError,
  createError,
} from './errors';

// Response
export {
  successResponse,
  errorResponse,
  type SuccessResponse,
  type ErrorResponse,
  type ApiResponse,
} from './response';

// Validators
export {
  requireString,
  optionalString,
  requireNumber,
  requireBoolean,
  requireArray,
  validateEmail,
  validateVisibleUserId,
  validatePassword,
  validateNickname,
  requireAuth,
} from './validators';

// Subscription
export {
  FREE_PLAN_MESSAGE_LIMIT,
  isPremiumUser,
  canSendMessage,
  incrementMessageCount,
  canSendMedia,
  canDeleteMessage,
  canUsePanicButton,
} from './subscription';
