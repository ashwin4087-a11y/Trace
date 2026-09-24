import { useState } from "react";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { errorText } from "../../lib/errors";
import { generateCertificate } from "../../services/certificate.service";
import { useWorkshopContext } from "../../hooks/useWorkshopContext";
import { WorkshopSelector } from "../../components/common/WorkshopSelector";

export function OrganizerCertificatesPage() {
  const workshops = useWorkshopList({ mine: 1 });
  const { workshopId, setWorkshopId } = useWorkshopContext(workshops.data);
  const [participantId, setParticipantId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <OrganizerLayout title="Faculty Certificate Issuance Console">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <WorkshopSelector 
          workshops={workshops.data} 
          selectedId={workshopId} 
          onSelect={setWorkshopId} 
          isLoading={workshops.isLoading} 
        />
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setCode("");
            try {
              const certificate = await generateCertificate(workshopId, participantId);
              setCode(certificate.certificateCode);
            } catch (caught) {
              setError(errorText(caught));
            }
          }}
        >
          <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
            <div>
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Cryptographic Issuance
              </span>
              <h3 className="font-serif text-xl font-semibold text-[#1A1412] mt-0.5">
                Issue Verified Certificate to Scholar
              </h3>
            </div>
            <TraceBadge variant="terracotta">90% Threshold Check</TraceBadge>
          </div>

          <p className="font-sans text-xs text-[#5F524B] leading-relaxed">
            The server validates participant eligibility against session attendance logs. If minimum threshold (90%) is met, a verifiable certificate code and cryptographic DID record are created.
          </p>

          <Input
            label="Participant Scholar User ID"
            placeholder="e.g. user_id..."
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            required
          />

          {error ? <ErrorState message={error} /> : null}

          {code ? (
            <div className="p-4 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs text-[#1A1412] flex flex-col gap-1">
              <span className="font-bold text-[#BF9270] uppercase">Certificate Issued Successfully!</span>
              <span className="font-mono text-sm font-bold">Code: {code}</span>
            </div>
          ) : null}

          <div className="pt-2">
            <TraceButton type="submit" disabled={!workshopId} icon="workspace_premium">
              Validate Eligibility & Issue Certificate
            </TraceButton>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
