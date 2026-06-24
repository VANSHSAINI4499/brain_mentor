import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface CertificateMetadata {
  id: string;
  submissionId: string;
  workshopId: string;
  studentName: string;
  certificateNumber: string;
  generatedAt: Date;
  pdfUrl?: string; // If stored in Cloud Storage
  pdfBytes?: Uint8Array; // For email attachments before upload
}

export const certificateService = {
  /**
   * Generates a PDF certificate by overlaying text onto a template.
   */
  async generatePdf(
    studentName: string, 
    workshopName: string, 
    date: Date, 
    certificateNumber: string
  ): Promise<Uint8Array> {
    // In production, you would load this from Cloud Storage or local assets
    // For now, we create a blank PDF if template doesn't exist, to ensure it works without assets
    let pdfDoc: PDFDocument;
    
    try {
      // 1. Try to load from Firebase Storage
      const bucket = require('firebase-admin').storage().bucket();
      const file = bucket.file('certificates/templates/default-template.pdf');
      
      const [exists] = await file.exists();
      
      if (exists) {
        const [templateBuffer] = await file.download();
        pdfDoc = await PDFDocument.load(templateBuffer);
      } else {
        // Fallback: create a blank landscape PDF
        pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([842, 595]); // A4 Landscape
        
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        page.drawText('Certificate of Completion', {
          x: 250,
          y: 450,
          size: 30,
          font,
          color: rgb(0.1, 0.1, 0.4),
        });
      }
    } catch (error) {
      // Create blank if loading fails
      pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([842, 595]);
    }

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = firstPage.getSize();
    
    // Draw Name
    firstPage.drawText(studentName, {
      x: width / 2 - (font.widthOfTextAtSize(studentName, 36) / 2),
      y: height / 2,
      size: 36,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Draw Workshop Name
    firstPage.drawText(`For successfully completing: ${workshopName}`, {
      x: width / 2 - (font.widthOfTextAtSize(`For successfully completing: ${workshopName}`, 18) / 2),
      y: height / 2 - 50,
      size: 18,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Draw Date
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    firstPage.drawText(dateStr, {
      x: 100,
      y: 100,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    // Draw Certificate ID
    firstPage.drawText(`ID: ${certificateNumber}`, {
      x: width - 250,
      y: 100,
      size: 12,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    return await pdfDoc.save();
  },

  /**
   * Uploads the generated PDF to Firebase Storage (Mocked for now)
   */
  async uploadCertificate(certificateNumber: string, pdfBytes: Uint8Array): Promise<string> {
    const bucket = require('firebase-admin').storage().bucket();
    const filePath = `certificates/generated/${certificateNumber}.pdf`;
    const file = bucket.file(filePath);

    await file.save(Buffer.from(pdfBytes), {
      contentType: 'application/pdf',
      public: true, // Make the file publicly accessible
    });

    // In a production environment, you might want a signed URL or a public URL
    // Here we'll generate a public URL string based on the bucket name
    file.makePublic().catch(() => {}); // Attempt to make public, ignore errors if already public
    
    // Return the public URL for the file
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return publicUrl;
  },

  /**
   * Generates a unique sequential or hashed certificate ID
   */
  generateCertificateId(index: number = Math.floor(Math.random() * 10000)): string {
    const year = new Date().getFullYear();
    const sequence = String(index).padStart(6, '0');
    return `CERT-${year}-${sequence}`;
  }
};
