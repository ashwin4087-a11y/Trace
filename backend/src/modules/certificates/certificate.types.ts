export type CertificateVerificationView = {
  valid: boolean;
  certificateCode: string;
  participantName: string;
  workshopTitle: string;
  attendancePercentage: number;
  issuedAt: Date;
  pdfPath: string | null;
};
