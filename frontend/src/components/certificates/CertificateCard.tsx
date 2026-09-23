import type { Certificate } from "../../types/certificate";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <article className="rounded-lg border border-line bg-card p-4">
      <h3 className="font-bold">{certificate.workshop?.title ?? "Workshop"}</h3>
      <p className="text-sm">ID {certificate.certificateCode}</p>
      <p className="text-sm">Attendance {certificate.attendancePercentage}%</p>
      <a className="text-sm text-brand" href={`/verify/${certificate.certificateCode}`}>Verification page</a>
    </article>
  );
}
