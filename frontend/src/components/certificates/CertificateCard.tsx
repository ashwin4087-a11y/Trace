import type { Certificate } from "../../types/certificate";


export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <article className="rounded-lg border border-[#DFC1B0] bg-[#FFFFFF] p-5 shadow-xs flex flex-col gap-4">
      <div>
        <h3 className="font-serif text-lg font-bold text-[#1A1412] leading-tight">
          {certificate.workshop?.title ?? "Workshop"}
        </h3>
        <p className="font-sans text-xs text-[#5F524B] mt-1">
          Credential ID: {certificate.certificateCode}
        </p>
      </div>

      <div className="flex justify-between items-center py-3 border-y border-[#DFC1B0]/50">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#BF9270]">Attendance</p>
          <p className="font-semibold text-[#1A1412]">{certificate.attendancePercentage}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#BF9270]">Issued On</p>
          <p className="font-semibold text-[#1A1412]">
            {new Date(certificate.issuedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1">
        {certificate.pdfPath ? (
          <a
            href={certificate.pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-[#BF9270] text-[#FFEDDB] text-xs font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            download
          >
            DOWNLOAD CERTIFICATE
          </a>
        ) : null}
        <a
          href={`/verify/${certificate.certificateCode}`}
          className="flex-1 text-center bg-[#FFEDDB] text-[#1A1412] border border-[#DFC1B0] text-xs font-bold py-2.5 rounded-lg hover:bg-[#F5E0CD] transition-colors"
        >
          VERIFY
        </a>
      </div>
    </article>
  );
}
