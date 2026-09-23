import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "../../components/layout/MainLayout";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
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
      <h1 className="mb-4 text-3xl font-bold">Certificate verification</h1>
      <form
        className="mb-4 flex max-w-xl gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.trim()) navigate(`/verify/${code.trim()}`);
        }}
      >
        <div className="flex-1"><Input label="Certificate ID" value={code} onChange={(event) => setCode(event.target.value)} /></div>
        <Button className="self-end" type="submit">Verify</Button>
      </form>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
      {query.data ? (
        <Card title="Valid certificate">
          <p>{query.data.participantName}</p>
          <p>{query.data.workshopTitle}</p>
          <p>Attendance recorded by the server: {query.data.attendancePercentage}%</p>
          <p>Issued {new Date(query.data.issuedAt).toLocaleDateString()}</p>
          {query.data.pdfPath ? <a className="text-brand underline" href={query.data.pdfPath}>Download PDF</a> : null}
        </Card>
      ) : null}
    </MainLayout>
  );
}
