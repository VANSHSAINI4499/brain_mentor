import * as nodemailer from 'nodemailer';

// In a real application, these credentials would be stored in Firebase Secret Manager
// and retrieved using functions.config() or defineSecret()
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_password'
  }
});

export const sendEmail = async (
  to: string, 
  subject: string, 
  htmlBody: string, 
  attachments?: { filename: string, content: Uint8Array }[]
): Promise<boolean> => {
  try {
    const mailOptions: any = {
      from: '"Workshop Team" <noreply@workshop-feedback.app>',
      to,
      subject,
      html: htmlBody,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content),
        contentType: 'application/pdf'
      }));
    }

    // In a mocked environment without real SMTP credentials, we just log.
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
      console.log(`[MOCK EMAIL] Sent to: ${to} | Subject: ${subject}`);
      if (attachments) console.log(`[MOCK EMAIL] Included ${attachments.length} attachments.`);
      return true;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
};
