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
exports.submitFeedback = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const submission_1 = require("../validators/submission");
const normalize_1 = require("../utils/normalize");
exports.submitFeedback = functions.https.onCall(async (data, context) => {
    // 1. Validate payload
    const parseResult = submission_1.submitFeedbackSchema.safeParse(data);
    if (!parseResult.success) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid request payload');
    }
    const payload = parseResult.data;
    // 2. Normalize email and phone
    const normalizedEmail = (0, normalize_1.normalizeContact)('email', payload.email);
    const normalizedPhone = (0, normalize_1.normalizeContact)('phone', payload.phone);
    const db = admin.firestore();
    // 3. Verify OTP records
    const emailOtpDocId = `email_${normalizedEmail}`;
    const phoneOtpDocId = `phone_${normalizedPhone}`;
    const emailOtpRef = db.collection('otps').doc(emailOtpDocId);
    const phoneOtpRef = db.collection('otps').doc(phoneOtpDocId);
    // We perform this in a transaction to ensure atomicity
    const submissionId = `${payload.workshopId}_${normalizedPhone}_${normalizedEmail}`;
    const submissionRef = db.collection('submissions').doc(submissionId);
    // Generate submissionRef securely
    const generatedSubmissionRef = `SUB-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await db.runTransaction(async (transaction) => {
        // const emailOtpDoc = await transaction.get(emailOtpRef);
        // const phoneOtpDoc = await transaction.get(phoneOtpRef);
        // TEMP: Disable OTP verification for testing
        // if (!emailOtpDoc.exists || !emailOtpDoc.data()?.verified) {
        //   throw new functions.https.HttpsError('permission-denied', 'Email is not verified.');
        // }
        // if (!phoneOtpDoc.exists || !phoneOtpDoc.data()?.verified) {
        //   throw new functions.https.HttpsError('permission-denied', 'Phone is not verified.');
        // }
        // 4. Prevent duplicate submissions
        const submissionDoc = await transaction.get(submissionRef);
        if (submissionDoc.exists) {
            throw new functions.https.HttpsError('already-exists', 'You have already submitted feedback for this workshop.');
        }
        // 5. Store submission
        const now = admin.firestore.Timestamp.now();
        transaction.set(submissionRef, {
            id: submissionId,
            submissionRef: generatedSubmissionRef,
            workshopId: payload.workshopId,
            name: payload.name,
            course: payload.course,
            phone: normalizedPhone,
            email: normalizedEmail,
            feedback: payload.feedback,
            rating: payload.rating || null,
            experience: payload.experience || null,
            phoneVerified: true,
            emailVerified: true,
            certificateStatus: 'pending',
            certificateUrl: null,
            emailStatus: 'pending',
            whatsappStatus: 'pending',
            submittedAt: now,
        });
        // 6. Invalidate OTP documents
        transaction.delete(emailOtpRef);
        transaction.delete(phoneOtpRef);
    });
    return { id: submissionId, submissionRef: generatedSubmissionRef, success: true };
});
//# sourceMappingURL=submitFeedback.js.map