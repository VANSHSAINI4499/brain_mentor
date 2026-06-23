import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateOtpSchema } from '../validators/otp';
import { normalizeContact } from '../utils/normalize';
import { hashValue } from '../utils/hash';

const RATE_LIMIT_MINUTES = 15;
const MAX_REQUESTS = 3;
const OTP_EXPIRY_MINUTES = 5;

export const generateOtp = functions.https.onCall(async (data, context) => {
  // 1. Validate payload
  const parseResult = generateOtpSchema.safeParse(data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid request payload');
  }
  const { type, value } = parseResult.data;

  // 2. Normalize input
  const normalizedValue = normalizeContact(type, value);
  const docId = `${type}_${normalizedValue}`;

  const db = admin.firestore();
  const otpRef = db.collection('otps').doc(docId);

  // 3. Rate limiting
  const now = admin.firestore.Timestamp.now();
  const docSnapshot = await otpRef.get();

  let requestCount = 1;
  let lastRequestedAt = now;

  if (docSnapshot.exists) {
    const existingData = docSnapshot.data()!;
    const lastRequest = existingData.lastRequestedAt as admin.firestore.Timestamp;
    
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
  const hashedCode = hashValue(rawOtp);

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
