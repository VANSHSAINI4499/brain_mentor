import { sendEmail } from './sendEmail';
import { sendWhatsApp } from './sendWhatsApp';

export const notificationService = {
  /**
   * Sends the certificate to the student via email.
   */
  async sendCertificateEmail(
    studentEmail: string,
    studentName: string,
    workshopName: string,
    certificateBytes: Uint8Array,
    certificateId: string
  ): Promise<boolean> {
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

    return await sendEmail(studentEmail, subject, htmlBody, [
      {
        filename: `${certificateId}.pdf`,
        content: certificateBytes
      }
    ]);
  },

  /**
   * Sends a WhatsApp notification to the student with a link to their certificate.
   */
  async sendCertificateWhatsApp(
    studentPhone: string,
    studentName: string,
    workshopName: string,
    certificateUrl: string
  ): Promise<boolean> {
    const message = `Hi ${studentName}! Congrats on completing the ${workshopName} workshop. You can download your certificate here: ${certificateUrl}`;
    
    return await sendWhatsApp(studentPhone, message, certificateUrl);
  }
};
