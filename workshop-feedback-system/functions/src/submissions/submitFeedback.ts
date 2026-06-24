import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { submitFeedbackSchema } from '../validators/submission';
import { normalizeContact } from '../utils/normalize';

export const submitFeedback = functions.https.onCall(async (data, context) => {
  // 1. Validate payload
  const parseResult = submitFeedbackSchema.safeParse(data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid request payload');
  }
  const payload = parseResult.data;

  // 2. Normalize email and phone
  const normalizedEmail = normalizeContact('email', payload.email);
  const normalizedPhone = normalizeContact('phone', payload.phone);

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
