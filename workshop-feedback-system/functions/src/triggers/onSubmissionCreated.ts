import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateCertificate } from '../certificates/generateCertificate';
import { certificateService } from '../services/certificateService';
import { notificationService } from '../notifications/notificationService';

// Ensure Firebase admin is initialized (usually done in index.ts, but safe to check)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Triggered when a new document is created in the 'submissions' collection.
 * Orchestrates the Certificate Generation & Notification Pipeline.
 */
export const onSubmissionCreated = functions.firestore
  .document('submissions/{submissionId}')
  .onCreate(async (snap, context) => {
    const submissionId = context.params.submissionId;
    const submissionData = snap.data();

    console.log(`Processing new submission: ${submissionId}`);

    try {
      // 1. Retrieve workshop data
      const workshopId = submissionData.workshopId;
      const workshopDoc = await admin.firestore().collection('workshops').doc(workshopId).get();
      
      if (!workshopDoc.exists) {
        throw new Error(`Workshop ${workshopId} not found for submission ${submissionId}`);
      }
      const workshopData = workshopDoc.data()!;

      // Initial Status Updates
      await snap.ref.update({
        certificateStatus: 'processing',
        emailStatus: 'processing',
        whatsappStatus: 'processing',
      });

      // 2. Generate Certificate ID and PDF
      const certificateId = certificateService.generateCertificateId();
      
      // We parse the workshop date if it's a Firestore Timestamp, otherwise use current date
      const workshopDate = workshopData.dateTime ? workshopData.dateTime.toDate() : new Date();

      const pdfBytes = await generateCertificate({
        studentName: submissionData.name,
        workshopName: workshopData.workshopName,
        date: workshopDate,
        certificateNumber: certificateId
      });

      // 3. Upload Certificate to Storage and get URL
      const certificateUrl = await certificateService.uploadCertificate(certificateId, pdfBytes);

      // Save Certificate Metadata
      await admin.firestore().collection('certificates').doc(certificateId).set({
        id: certificateId,
        submissionId: submissionId,
        workshopId: workshopId,
        studentName: submissionData.name,
        pdfUrl: certificateUrl,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update submission with certificate status
      await snap.ref.update({
        certificateStatus: 'sent',
        certificateUrl: certificateUrl,
      });

      // 4. Send Email Notification
      const emailSuccess = await notificationService.sendCertificateEmail(
        submissionData.email,
        submissionData.name,
        workshopData.workshopName,
        pdfBytes,
        certificateId
      );

      // 5. Send WhatsApp Notification
      const whatsappSuccess = await notificationService.sendCertificateWhatsApp(
        submissionData.phone,
        submissionData.name,
        workshopData.workshopName,
        certificateUrl
      );

      // Update final statuses
      await snap.ref.update({
        emailStatus: emailSuccess ? 'sent' : 'failed',
        whatsappStatus: whatsappSuccess ? 'sent' : 'failed',
        deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Pipeline completed for submission ${submissionId}`);

    } catch (error) {
      console.error(`Pipeline failed for submission ${submissionId}:`, error);
      
      // Update submission with failure status
      await snap.ref.update({
        certificateStatus: 'failed',
        emailStatus: 'failed',
        whatsappStatus: 'failed',
      });
    }
  });
