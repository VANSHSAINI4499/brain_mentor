import * as crypto from 'crypto';

/**
 * Hashes a string value (e.g. OTP code) using SHA-256.
 * We use a simple hash here, but for added security a salt could be used.
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
