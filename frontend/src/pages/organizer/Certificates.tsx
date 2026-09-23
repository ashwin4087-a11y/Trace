import { useState } from "react";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { errorText } from "../../lib/errors";
import { generateCertificate } from "../../services/certificate.service";

export function OrganizerCertificatesPage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";
  const [participantId, setParticipantId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return (
    <OrganizerLayout title="Certificates">
      <form
        className="grid max-w-md gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            const certificate = await generateCertificate(workshopId, participantId);
            setCode(certificate.certificateCode);
          } catch (caught) {
            setError(errorText(caught));
          }
        }}
      >
        <Input label="Participant user id" value={participantId} onChange={(event) => setParticipantId(event.target.value)} required />
        {error ? <ErrorState message={error} /> : null}
        <Button type="submit" disabled={!workshopId}>Generate if eligible</Button>
      </form>
      {code ? <p className="mt-3 text-sm">Issued {code}</p> : null}
    </OrganizerLayout>
  );
}
