"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificate = void 0;
const certificateService_1 = require("../services/certificateService");
/**
 * Encapsulates the logic of generating a certificate.
 */
const generateCertificate = async (params) => {
    console.log(`Generating certificate for ${params.studentName}...`);
    const pdfBytes = await certificateService_1.certificateService.generatePdf(params.studentName, params.workshopName, params.date, params.certificateNumber);
    console.log(`Certificate ${params.certificateNumber} generated successfully.`);
    return pdfBytes;
};
exports.generateCertificate = generateCertificate;
//# sourceMappingURL=generateCertificate.js.map