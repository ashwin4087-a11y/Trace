/** Certificate PDFs are generated in the certificate service during the request. */
export async function enqueueCertificate(certificateId: string) {
  return { mode: process.env.REDIS_URL ? "queued" : "inline", certificateId };
}
