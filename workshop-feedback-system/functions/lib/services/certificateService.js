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
exports.certificateService = void 0;
const pdf_lib_1 = require("pdf-lib");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.certificateService = {
    /**
     * Generates a PDF certificate by overlaying text onto a template.
     */
    async generatePdf(studentName, workshopName, date, certificateNumber) {
        // In production, you would load this from Cloud Storage or local assets
        // For now, we create a blank PDF if template doesn't exist, to ensure it works without assets
        let pdfDoc;
        try {
            const templatePath = path.join(__dirname, '../../assets/template.pdf');
            if (fs.existsSync(templatePath)) {
                const templateBytes = fs.readFileSync(templatePath);
                pdfDoc = await pdf_lib_1.PDFDocument.load(templateBytes);
            }
            else {
                // Fallback: create a blank landscape PDF
                pdfDoc = await pdf_lib_1.PDFDocument.create();
                const page = pdfDoc.addPage([842, 595]); // A4 Landscape
                const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
                page.drawText('Certificate of Completion', {
                    x: 250,
                    y: 450,
                    size: 30,
                    font,
                    color: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.4),
                });
            }
        }
        catch (error) {
            // Create blank if loading fails
            pdfDoc = await pdf_lib_1.PDFDocument.create();
            pdfDoc.addPage([842, 595]);
        }
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const { width, height } = firstPage.getSize();
        // Draw Name
        firstPage.drawText(studentName, {
            x: width / 2 - (font.widthOfTextAtSize(studentName, 36) / 2),
            y: height / 2,
            size: 36,
            font: boldFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // Draw Workshop Name
        firstPage.drawText(`For successfully completing: ${workshopName}`, {
            x: width / 2 - (font.widthOfTextAtSize(`For successfully completing: ${workshopName}`, 18) / 2),
            y: height / 2 - 50,
            size: 18,
            font,
            color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
        });
        // Draw Date
        const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        firstPage.drawText(dateStr, {
            x: 100,
            y: 100,
            size: 14,
            font,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // Draw Certificate ID
        firstPage.drawText(`ID: ${certificateNumber}`, {
            x: width - 250,
            y: 100,
            size: 12,
            font,
            color: (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4),
        });
        return await pdfDoc.save();
    },
    /**
     * Uploads the generated PDF to Firebase Storage (Mocked for now)
     */
    async uploadCertificate(certificateNumber, pdfBytes) {
        // MOCK: In production, upload to Firebase Storage and return the signed URL.
        return `https://storage.mock.firebase.com/certificates/${certificateNumber}.pdf`;
    },
    /**
     * Generates a unique sequential or hashed certificate ID
     */
    generateCertificateId(index = Math.floor(Math.random() * 10000)) {
        const year = new Date().getFullYear();
        const sequence = String(index).padStart(6, '0');
        return `CERT-${year}-${sequence}`;
    }
};
//# sourceMappingURL=certificateService.js.map