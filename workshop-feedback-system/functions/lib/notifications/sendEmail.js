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
exports.sendEmail = void 0;
const nodemailer = __importStar(require("nodemailer"));
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
const sendEmail = async (to, subject, htmlBody, attachments) => {
    try {
        const mailOptions = {
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
            if (attachments)
                console.log(`[MOCK EMAIL] Included ${attachments.length} attachments.`);
            return true;
        }
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        return false;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map