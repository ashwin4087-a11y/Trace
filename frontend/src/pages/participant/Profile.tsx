import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../../services/api";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Card } from "../../components/common/Card";
import { Loader } from "../../components/common/Loader";

export function ProfilePage() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => unwrap<Record<string, unknown>>(api.get("/profiles/me")),
  });
  const user = query.data?.user as { firstName?: string; lastName?: string; email?: string; preferredLanguage?: string } | undefined;
  return (
    <ParticipantLayout title="Profile">
      {query.isLoading ? <Loader /> : null}
      {user ? (
        <Card title={`${user.firstName} ${user.lastName}`}>
          <p>{user.email}</p>
          <p>Preferred language: {user.preferredLanguage}</p>
        </Card>
      ) : null}
    </ParticipantLayout>
  );
}
