"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = exports.respondToFriendRequest = exports.sendFriendRequest = void 0;
/**
 * 友達関連 Cloud Functions エクスポート
 */
var sendFriendRequest_1 = require("./sendFriendRequest");
Object.defineProperty(exports, "sendFriendRequest", { enumerable: true, get: function () { return sendFriendRequest_1.sendFriendRequest; } });
var respondToFriendRequest_1 = require("./respondToFriendRequest");
Object.defineProperty(exports, "respondToFriendRequest", { enumerable: true, get: function () { return respondToFriendRequest_1.respondToFriendRequest; } });
var blockUser_1 = require("./blockUser");
Object.defineProperty(exports, "blockUser", { enumerable: true, get: function () { return blockUser_1.blockUser; } });
//# sourceMappingURL=index.js.map