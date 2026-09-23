import { api, unwrap } from "./api";
import type { Certificate, CertificateVerification } from "../types/certificate";

export async function myCertificates() {
  return unwrap<Certificate[]>(await api.get("/certificates/me"));
}
export async function generateCertificate(workshopId: string, participantId?: string) {
  return unwrap<Certificate>(await api.post(`/certificates/workshops/${workshopId}/generate`, { participantId }));
}
export async function verifyCertificate(certificateId: string) {
  return unwrap<CertificateVerification>(await api.get(`/certificates/verify/${certificateId}`));
}
