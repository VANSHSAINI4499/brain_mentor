"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEmail = normalizeEmail;
exports.normalizePhone = normalizePhone;
exports.normalizeContact = normalizeContact;
/**
 * Normalizes an email address.
 * Trims whitespace and converts to lowercase.
 */
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
/**
 * Normalizes a phone number.
 * Trims whitespace and removes all non-digit characters.
 */
function normalizePhone(phone) {
    return phone.replace(/\D/g, '');
}
/**
 * Normalizes contact value based on type.
 */
function normalizeContact(type, value) {
    return type === 'email' ? normalizeEmail(value) : normalizePhone(value);
}
//# sourceMappingURL=normalize.js.map