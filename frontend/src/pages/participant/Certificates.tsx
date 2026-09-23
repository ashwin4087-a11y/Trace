import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { CertificateCard } from "../../components/certificates/CertificateCard";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
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
    <ParticipantLayout title="Certificates">
      <p className="mb-3 text-sm">The server recalculates attendance and refuses a certificate below 90%.</p>
      {workshopId ? <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Request certificate</Button> : null}
      {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
      <div className="mt-4 grid gap-3">
        {certificates.data?.map((certificate) => <CertificateCard key={certificate.id} certificate={certificate} />)}
      </div>
    </ParticipantLayout>
  );
}
