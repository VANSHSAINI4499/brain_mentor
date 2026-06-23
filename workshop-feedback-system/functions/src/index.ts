import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK once
admin.initializeApp();

// Export Cloud Functions
export { generateOtp } from './otp/generateOtp';
export { verifyOtp } from './otp/verifyOtp';
export { submitFeedback } from './submissions/submitFeedback';
export { onSubmissionCreated } from './triggers/onSubmissionCreated';
