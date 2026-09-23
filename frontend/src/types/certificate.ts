export type Certificate = {
  id: string;
  certificateCode: string;
  attendancePercentage: number;
  pdfPath?: string | null;
  issuedAt: string;
  workshop?: { id: string; title: string };
};

export type CertificateVerification = {
  valid: boolean;
  certificateCode: string;
  participantName: string;
  workshopTitle: string;
  attendancePercentage: number;
  issuedAt: string;
  pdfPath?: string | null;
};
