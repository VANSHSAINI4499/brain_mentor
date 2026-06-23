"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSubmissionCreated = exports.submitFeedback = exports.verifyOtp = exports.generateOtp = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize the Firebase Admin SDK once
admin.initializeApp();
// Export Cloud Functions
var generateOtp_1 = require("./otp/generateOtp");
Object.defineProperty(exports, "generateOtp", { enumerable: true, get: function () { return generateOtp_1.generateOtp; } });
var verifyOtp_1 = require("./otp/verifyOtp");
Object.defineProperty(exports, "verifyOtp", { enumerable: true, get: function () { return verifyOtp_1.verifyOtp; } });
var submitFeedback_1 = require("./submissions/submitFeedback");
Object.defineProperty(exports, "submitFeedback", { enumerable: true, get: function () { return submitFeedback_1.submitFeedback; } });
var onSubmissionCreated_1 = require("./triggers/onSubmissionCreated");
Object.defineProperty(exports, "onSubmissionCreated", { enumerable: true, get: function () { return onSubmissionCreated_1.onSubmissionCreated; } });
//# sourceMappingURL=index.js.map