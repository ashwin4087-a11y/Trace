import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { CertificateCard } from "../../components/certificates/CertificateCard";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useCertificate } from "../../hooks/useCertificate";
import { useRegistration } from "../../hooks/useRegistration";
import { errorText } from "../../lib/errors";
import { generateCertificate } from "../../services/certificate.service";

export function CertificatesPage() {
  const certificates = useCertificate();
  const registrations = useRegistration();
  const client = useQueryClient();
  const workshopId = registrations.data?.find((item) => item.status === "CONFIRMED")?.workshopId;

  const mutation = useMutation({
    mutationFn: () => generateCertificate(workshopId!),
    onSuccess: () => client.invalidateQueries({ queryKey: ["certificates"] }),
  });

  return (
    <ParticipantLayout title="Cryptographic Certificates & Credentials">
      <div className="flex flex-col gap-8">
        <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
          <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
            <div>
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Issuance Protocol
              </span>
              <h3 className="font-serif text-lg font-semibold text-[#1A1412] mt-0.5">
                Attendance Threshold Verification
              </h3>
            </div>
            <TraceBadge variant="terracotta">90% Threshold Required</TraceBadge>
          </div>

          <p className="font-sans text-xs text-[#5F524B] leading-relaxed">
            The server automatically recalculates your attendance log upon certificate request. If your attendance meets or exceeds 90%, an authenticated PDF certificate and cryptographic DID key are generated.
          </p>

          {workshopId ? (
            <div className="pt-2">
              <TraceButton
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                icon="workspace_premium"
              >
                {mutation.isPending ? "Evaluating & Generating..." : "Generate Certificate"}
              </TraceButton>
            </div>
          ) : (
            <p className="font-sans text-xs text-[#5F524B] italic">
              Confirmed workshop enrollment is required to request certificates.
            </p>
          )}

          {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
        </div>

        {/* Issued Certificates List */}
        <section className="flex flex-col gap-4">
          <h3 className="font-serif text-xl font-semibold text-[#1A1412]">
            Issued Certificates ({certificates.data?.length ?? 0})
          </h3>

          {certificates.isLoading ? <Loader /> : null}

          {certificates.data && certificates.data.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 text-center text-xs text-[#5F524B]">
              No certificates issued yet. Fulfill attendance requirements for your enrolled workshops to generate your credentials.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.data?.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        </section>
      </div>
    </ParticipantLayout>
  );
}
