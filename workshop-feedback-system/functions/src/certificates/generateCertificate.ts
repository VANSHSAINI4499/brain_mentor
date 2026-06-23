import { certificateService } from '../services/certificateService';

interface GenerateCertificateParams {
  studentName: string;
  workshopName: string;
  date: Date;
  certificateNumber: string;
}

/**
 * Encapsulates the logic of generating a certificate.
 */
export const generateCertificate = async (params: GenerateCertificateParams): Promise<Uint8Array> => {
  console.log(`Generating certificate for ${params.studentName}...`);
  const pdfBytes = await certificateService.generatePdf(
    params.studentName,
    params.workshopName,
    params.date,
    params.certificateNumber
  );
  console.log(`Certificate ${params.certificateNumber} generated successfully.`);
  return pdfBytes;
};
