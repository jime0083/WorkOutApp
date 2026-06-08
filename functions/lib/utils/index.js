"use strict";
/**
 * ユーティリティのエクスポート
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUsePanicButton = exports.canDeleteMessage = exports.canSendMedia = exports.incrementMessageCount = exports.canSendMessage = exports.isPremiumUser = exports.FREE_PLAN_MESSAGE_LIMIT = exports.requireAuth = exports.validateNickname = exports.validatePassword = exports.validateVisibleUserId = exports.validateEmail = exports.requireArray = exports.requireBoolean = exports.requireNumber = exports.optionalString = exports.requireString = exports.errorResponse = exports.successResponse = exports.createError = exports.handleError = exports.AppErrorCode = exports.AppError = exports.admin = exports.messaging = exports.storage = exports.auth = exports.db = void 0;
// Firebase
var firebase_1 = require("./firebase");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return firebase_1.db; } });
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return firebase_1.auth; } });
Object.defineProperty(exports, "storage", { enumerable: true, get: function () { return firebase_1.storage; } });
Object.defineProperty(exports, "messaging", { enumerable: true, get: function () { return firebase_1.messaging; } });
Object.defineProperty(exports, "admin", { enumerable: true, get: function () { return firebase_1.admin; } });
// Errors
var errors_1 = require("./errors");
Object.defineProperty(exports, "AppError", { enumerable: true, get: function () { return errors_1.AppError; } });
Object.defineProperty(exports, "AppErrorCode", { enumerable: true, get: function () { return errors_1.AppErrorCode; } });
Object.defineProperty(exports, "handleError", { enumerable: true, get: function () { return errors_1.handleError; } });
Object.defineProperty(exports, "createError", { enumerable: true, get: function () { return errors_1.createError; } });
// Response
var response_1 = require("./response");
Object.defineProperty(exports, "successResponse", { enumerable: true, get: function () { return response_1.successResponse; } });
Object.defineProperty(exports, "errorResponse", { enumerable: true, get: function () { return response_1.errorResponse; } });
// Validators
var validators_1 = require("./validators");
Object.defineProperty(exports, "requireString", { enumerable: true, get: function () { return validators_1.requireString; } });
Object.defineProperty(exports, "optionalString", { enumerable: true, get: function () { return validators_1.optionalString; } });
Object.defineProperty(exports, "requireNumber", { enumerable: true, get: function () { return validators_1.requireNumber; } });
Object.defineProperty(exports, "requireBoolean", { enumerable: true, get: function () { return validators_1.requireBoolean; } });
Object.defineProperty(exports, "requireArray", { enumerable: true, get: function () { return validators_1.requireArray; } });
Object.defineProperty(exports, "validateEmail", { enumerable: true, get: function () { return validators_1.validateEmail; } });
Object.defineProperty(exports, "validateVisibleUserId", { enumerable: true, get: function () { return validators_1.validateVisibleUserId; } });
Object.defineProperty(exports, "validatePassword", { enumerable: true, get: function () { return validators_1.validatePassword; } });
Object.defineProperty(exports, "validateNickname", { enumerable: true, get: function () { return validators_1.validateNickname; } });
Object.defineProperty(exports, "requireAuth", { enumerable: true, get: function () { return validators_1.requireAuth; } });
// Subscription
var subscription_1 = require("./subscription");
Object.defineProperty(exports, "FREE_PLAN_MESSAGE_LIMIT", { enumerable: true, get: function () { return subscription_1.FREE_PLAN_MESSAGE_LIMIT; } });
Object.defineProperty(exports, "isPremiumUser", { enumerable: true, get: function () { return subscription_1.isPremiumUser; } });
Object.defineProperty(exports, "canSendMessage", { enumerable: true, get: function () { return subscription_1.canSendMessage; } });
Object.defineProperty(exports, "incrementMessageCount", { enumerable: true, get: function () { return subscription_1.incrementMessageCount; } });
Object.defineProperty(exports, "canSendMedia", { enumerable: true, get: function () { return subscription_1.canSendMedia; } });
Object.defineProperty(exports, "canDeleteMessage", { enumerable: true, get: function () { return subscription_1.canDeleteMessage; } });
Object.defineProperty(exports, "canUsePanicButton", { enumerable: true, get: function () { return subscription_1.canUsePanicButton; } });
//# sourceMappingURL=index.js.map