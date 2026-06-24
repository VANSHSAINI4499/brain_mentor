"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const sendEmail_1 = require("./sendEmail");
const sendWhatsApp_1 = require("./sendWhatsApp");
exports.notificationService = {
    /**
     * Sends the certificate to the student via email.
     */
    async sendCertificateEmail(studentEmail, studentName, workshopName, certificateBytes, certificateId) {
        const subject = `Your Certificate of Completion: ${workshopName}`;
        const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations, ${studentName}!</h2>
        <p>Thank you for attending the <strong>${workshopName}</strong> workshop and submitting your feedback.</p>
        <p>Please find your official Certificate of Completion attached to this email.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Workshop Team</p>
      </div>
    `;
        return await (0, sendEmail_1.sendEmail)(studentEmail, subject, htmlBody, [
            {
                filename: `${certificateId}.pdf`,
                content: certificateBytes
            }
        ]);
    },
    /**
     * Sends a WhatsApp notification to the student with a link to their certificate.
     */
    async sendCertificateWhatsApp(studentPhone, studentName, workshopName, certificateUrl) {
        const message = `Hi ${studentName}! Congrats on completing the ${workshopName} workshop. You can download your certificate here: ${certificateUrl}`;
        return await (0, sendWhatsApp_1.sendWhatsApp)(studentPhone, message, certificateUrl);
    }
};
//# sourceMappingURL=notificationService.js.map