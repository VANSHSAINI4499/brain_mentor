import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { verifyOtpSchema } from '../validators/otp';
import { normalizeContact } from '../utils/normalize';
import { hashValue } from '../utils/hash';

const MAX_ATTEMPTS = 3;

export const verifyOtp = functions.https.onCall(async (data, context) => {
  // 1. Validate payload
  const parseResult = verifyOtpSchema.safeParse(data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid request payload');
  }
  const { type, value, code } = parseResult.data;

  // 2. Normalize input
  const normalizedValue = normalizeContact(type, value);
  const docId = `${type}_${normalizedValue}`;

  const db = admin.firestore();
  const otpRef = db.collection('otps').doc(docId);

  const docSnapshot = await otpRef.get();

  if (!docSnapshot.exists) {
    throw new functions.https.HttpsError('not-found', 'OTP not found. Please request a new one.');
  }

  const otpData = docSnapshot.data()!;
  
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
  const incomingHash = hashValue(code);
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
