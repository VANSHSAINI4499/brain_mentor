"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedbackSchema = void 0;
const zod_1 = require("zod");
exports.submitFeedbackSchema = zod_1.z.object({
    workshopId: zod_1.z.string().min(1, 'Workshop ID is required'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    course: zod_1.z.string().min(2, 'Course must be at least 2 characters'),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 digits'),
    email: zod_1.z.string().email('Invalid email address'),
    feedback: zod_1.z.string().min(10, 'Feedback must be at least 10 characters'),
    phoneVerified: zod_1.z.boolean().refine((val) => val === true, 'Phone must be verified'),
    emailVerified: zod_1.z.boolean().refine((val) => val === true, 'Email must be verified'),
});
//# sourceMappingURL=submission.js.map