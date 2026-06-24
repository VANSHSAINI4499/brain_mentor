"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpSchema = exports.generateOtpSchema = void 0;
const zod_1 = require("zod");
exports.generateOtpSchema = zod_1.z.object({
    type: zod_1.z.enum(['phone', 'email']),
    value: zod_1.z.string().min(1, 'Contact value is required'),
});
exports.verifyOtpSchema = zod_1.z.object({
    type: zod_1.z.enum(['phone', 'email']),
    value: zod_1.z.string().min(1, 'Contact value is required'),
    code: zod_1.z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});
//# sourceMappingURL=otp.js.map