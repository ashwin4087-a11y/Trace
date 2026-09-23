import { useQuery } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { StatGrid } from "../../components/analytics/StatGrid";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { errorText } from "../../lib/errors";
import { myAnalytics } from "../../services/analytics.service";

export function ParticipantDashboardPage() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["analytics", "me"], queryFn: myAnalytics });
  const data = query.data as { workshopsRegistered?: number; certificates?: number; skills?: number; learningPaths?: number } | undefined;
  return (
    <ParticipantLayout title={`Hello, ${user?.firstName ?? ""}`}>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
      {data ? (
        <StatGrid
          stats={[
            { label: "Registered", value: data.workshopsRegistered ?? 0 },
            { label: "Certificates", value: data.certificates ?? 0 },
            { label: "Skills", value: data.skills ?? 0 },
            { label: "Paths", value: data.learningPaths ?? 0 },
          ]}
        />
      ) : null}
    </ParticipantLayout>
  );
}
