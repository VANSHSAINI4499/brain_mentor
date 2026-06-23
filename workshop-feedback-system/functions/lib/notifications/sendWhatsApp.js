"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsApp = void 0;
/**
 * Mock implementation of a WhatsApp sender.
 * In a real application, this would integrate with Twilio or Meta WhatsApp API.
 */
const sendWhatsApp = async (phoneNumber, message, mediaUrl) => {
    try {
        // MOCK IMPLEMENTATION
        console.log(`[MOCK WHATSAPP] Sent to: ${phoneNumber}`);
        console.log(`[MOCK WHATSAPP] Message: ${message}`);
        if (mediaUrl) {
            console.log(`[MOCK WHATSAPP] Attached Media URL: ${mediaUrl}`);
        }
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }
    catch (error) {
        console.error(`Failed to send WhatsApp message to ${phoneNumber}:`, error);
        return false;
    }
};
exports.sendWhatsApp = sendWhatsApp;
//# sourceMappingURL=sendWhatsApp.js.map