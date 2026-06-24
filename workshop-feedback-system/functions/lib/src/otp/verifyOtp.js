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
exports.verifyOtp = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const otp_1 = require("../validators/otp");
const normalize_1 = require("../utils/normalize");
const hash_1 = require("../utils/hash");
const MAX_ATTEMPTS = 3;
exports.verifyOtp = functions.https.onCall(async (data, context) => {
    // 1. Validate payload
    const parseResult = otp_1.verifyOtpSchema.safeParse(data);
    if (!parseResult.success) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid request payload');
    }
    const { type, value, code } = parseResult.data;
    // 2. Normalize input
    const normalizedValue = (0, normalize_1.normalizeContact)(type, value);
    const docId = `${type}_${normalizedValue}`;
    const db = admin.firestore();
    const otpRef = db.collection('otps').doc(docId);
    const docSnapshot = await otpRef.get();
    if (!docSnapshot.exists) {
        throw new functions.https.HttpsError('not-found', 'OTP not found. Please request a new one.');
    }
    const otpData = docSnapshot.data();
    // 3. Enforce expiry
    const now = admin.firestore.Timestamp.now();
    if (now.toMillis() > otpData.expiresAt.toMillis()) {
        throw new functions.https.HttpsError('deadline-exceeded', 'OTP has expired.');
    }
    // 4. Enforce max attempts
    if (otpData.attempts >= MAX_ATTEMPTS) {
        throw new functions.https.HttpsError('resource-exhausted', 'Maximum verification attempts exceeded. Please request a new OTP.');
    }
    // 5. Compare hashed code
    const incomingHash = (0, hash_1.hashValue)(code);
    if (incomingHash !== otpData.hashedCode) {
        // Increment attempts
        await otpRef.update({
            attempts: admin.firestore.FieldValue.increment(1)
        });
        throw new functions.https.HttpsError('invalid-argument', 'Invalid OTP code.');
    }
    // 6. Mark as verified
    await otpRef.update({
        verified: true,
    });
    return { verified: true };
});
//# sourceMappingURL=verifyOtp.js.map