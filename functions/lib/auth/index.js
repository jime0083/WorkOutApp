"use strict";
/**
 * 認証関連Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRealUserId = exports.setupDummyAccount = exports.onUserDelete = exports.onUserCreate = void 0;
var onCreate_1 = require("./onCreate");
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return onCreate_1.onUserCreate; } });
var onDelete_1 = require("./onDelete");
Object.defineProperty(exports, "onUserDelete", { enumerable: true, get: function () { return onDelete_1.onUserDelete; } });
var setupDummy_1 = require("./setupDummy");
Object.defineProperty(exports, "setupDummyAccount", { enumerable: true, get: function () { return setupDummy_1.setupDummyAccount; } });
Object.defineProperty(exports, "resolveRealUserId", { enumerable: true, get: function () { return setupDummy_1.resolveRealUserId; } });
//# sourceMappingURL=index.js.map