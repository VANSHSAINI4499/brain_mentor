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
exports.onSubmissionCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const generateCertificate_1 = require("../certificates/generateCertificate");
const certificateService_1 = require("../services/certificateService");
const notificationService_1 = require("../notifications/notificationService");
// Ensure Firebase admin is initialized (usually done in index.ts, but safe to check)
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * Triggered when a new document is created in the 'submissions' collection.
 * Orchestrates the Certificate Generation & Notification Pipeline.
 */
exports.onSubmissionCreated = functions.firestore
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
        const workshopData = workshopDoc.data();
        // Initial Status Updates
        await snap.ref.update({
            certificateStatus: 'processing',
            emailStatus: 'processing',
            whatsappStatus: 'processing',
        });
        // 2. Generate Certificate ID and PDF
        const certificateId = certificateService_1.certificateService.generateCertificateId();
        // We parse the workshop date if it's a Firestore Timestamp, otherwise use current date
        const workshopDate = workshopData.dateTime ? workshopData.dateTime.toDate() : new Date();
        const pdfBytes = await (0, generateCertificate_1.generateCertificate)({
            studentName: submissionData.name,
            workshopName: workshopData.workshopName,
            date: workshopDate,
            certificateNumber: certificateId
        });
        // 3. Upload Certificate to Storage and get URL
        const certificateUrl = await certificateService_1.certificateService.uploadCertificate(certificateId, pdfBytes);
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
        const emailSuccess = await notificationService_1.notificationService.sendCertificateEmail(submissionData.email, submissionData.name, workshopData.workshopName, pdfBytes, certificateId);
        // 5. Send WhatsApp Notification
        const whatsappSuccess = await notificationService_1.notificationService.sendCertificateWhatsApp(submissionData.phone, submissionData.name, workshopData.workshopName, certificateUrl);
        // Update final statuses
        await snap.ref.update({
            emailStatus: emailSuccess ? 'sent' : 'failed',
            whatsappStatus: whatsappSuccess ? 'sent' : 'failed',
            deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Pipeline completed for submission ${submissionId}`);
    }
    catch (error) {
        console.error(`Pipeline failed for submission ${submissionId}:`, error);
        // Update submission with failure status
        await snap.ref.update({
            certificateStatus: 'failed',
            emailStatus: 'failed',
            whatsappStatus: 'failed',
        });
    }
});
//# sourceMappingURL=onSubmissionCreated.js.map