import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "../../components/layout/MainLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Loader } from "../../components/common/Loader";
import { errorText } from "../../lib/errors";
import { verifyCertificate } from "../../services/certificate.service";

export function CertificateVerificationPage() {
  const { certificateId = "" } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(certificateId === "lookup" ? "" : certificateId);
  const query = useQuery({
    queryKey: ["verify", certificateId],
    queryFn: () => verifyCertificate(certificateId),
    enabled: Boolean(certificateId) && certificateId !== "lookup",
    retry: false,
  });

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div>
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
            Cryptographic Registry
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1412] font-normal mt-1">
            Certificate Verification
          </h1>
          <p className="font-sans text-sm text-[#5F524B] mt-1">
            Enter a TRACE certificate identifier code to verify its authenticity, attendance record, and cryptographic signature.
          </p>
        </div>

        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-6 flex flex-col md:flex-row gap-3 items-end shadow-xs"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) navigate(`/verify/${code.trim()}`);
          }}
        >
          <div className="flex-1 w-full">
            <Input
              label="Certificate Reference ID"
              placeholder="e.g. CERT-2026-8821"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full md:w-auto px-6 py-2 bg-[#BF9270] text-[#FFEDDB] font-semibold rounded-lg hover:bg-[#261D1A]">
            Verify Credential
          </Button>
        </form>

        {query.isLoading ? <Loader /> : null}
        {query.isError ? <ErrorState message={errorText(query.error)} /> : null}

        {query.data ? (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-8 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#DFC1B0]/70 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#BF9270]"></span>
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                  Authentic Credential Record
                </span>
              </div>
              <span className="font-sans text-xs text-[#5F524B]">DID:AUREX-TRACE-2026</span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-serif text-2xl font-semibold text-[#1A1412]">{query.data.participantName}</h2>
              <p className="font-sans text-base text-[#BF9270] font-medium">{query.data.workshopTitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-[#DFC1B0]/50 font-sans text-sm">
              <div>
                <span className="text-[#5F524B] text-xs block">Server-Verified Attendance</span>
                <span className="font-semibold text-[#1A1412] text-lg">{query.data.attendancePercentage}%</span>
              </div>
              <div>
                <span className="text-[#5F524B] text-xs block">Issue Date</span>
                <span className="font-semibold text-[#1A1412] text-lg">{new Date(query.data.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {query.data.pdfPath ? (
              <a
                className="self-start inline-flex items-center gap-2 px-4 py-2 bg-[#FFEDDB] border border-[#DFC1B0] text-[#1A1412] text-xs font-semibold rounded-lg hover:bg-[#BF9270] hover:text-[#FFEDDB] transition-colors"
                href={query.data.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[18px]">download</span> Download Official Certificate PDF
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
