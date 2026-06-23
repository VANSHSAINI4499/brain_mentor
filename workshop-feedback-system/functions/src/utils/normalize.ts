/**
 * Normalizes an email address.
 * Trims whitespace and converts to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes a phone number.
 * Trims whitespace and removes all non-digit characters.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Normalizes contact value based on type.
 */
export function normalizeContact(type: 'email' | 'phone', value: string): string {
  return type === 'email' ? normalizeEmail(value) : normalizePhone(value);
}
