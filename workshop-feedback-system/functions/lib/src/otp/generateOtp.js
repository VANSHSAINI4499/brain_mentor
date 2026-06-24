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
exports.generateOtp = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const otp_1 = require("../validators/otp");
const normalize_1 = require("../utils/normalize");
const hash_1 = require("../utils/hash");
const RATE_LIMIT_MINUTES = 15;
const MAX_REQUESTS = 3;
const OTP_EXPIRY_MINUTES = 5;
exports.generateOtp = functions.https.onCall(async (data, context) => {
    // 1. Validate payload
    const parseResult = otp_1.generateOtpSchema.safeParse(data);
    if (!parseResult.success) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid request payload');
    }
    const { type, value } = parseResult.data;
    // 2. Normalize input
    const normalizedValue = (0, normalize_1.normalizeContact)(type, value);
    const docId = `${type}_${normalizedValue}`;
    const db = admin.firestore();
    const otpRef = db.collection('otps').doc(docId);
    // 3. Rate limiting
    const now = admin.firestore.Timestamp.now();
    const docSnapshot = await otpRef.get();
    let requestCount = 1;
    let lastRequestedAt = now;
    if (docSnapshot.exists) {
        const existingData = docSnapshot.data();
        const lastRequest = existingData.lastRequestedAt;
        // If the last request was within the rate limit window
        if (now.toMillis() - lastRequest.toMillis() < RATE_LIMIT_MINUTES * 60 * 1000) {
            if (existingData.requestCount >= MAX_REQUESTS) {
                throw new functions.https.HttpsError('resource-exhausted', 'Too many OTP requests. Please try again later.');
            }
            requestCount = existingData.requestCount + 1;
        }
    }
    // 4. Generate 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // Log the raw OTP for emulator testing (would not do this in prod)
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
        functions.logger.info(`[EMULATOR] Generated OTP for ${docId}: ${rawOtp}`);
    }
    // 5. Hash the OTP
    const hashedCode = (0, hash_1.hashValue)(rawOtp);
    // 6. Calculate expiry
    const expiresAt = admin.firestore.Timestamp.fromMillis(now.toMillis() + OTP_EXPIRY_MINUTES * 60 * 1000);
    // 7. Store in Firestore
    await otpRef.set({
        hashedCode,
        expiresAt,
        attempts: 0,
        verified: false,
        createdAt: now,
        requestCount,
        lastRequestedAt,
    });
    // 8. Return success
    return { success: true };
});
//# sourceMappingURL=generateOtp.js.map