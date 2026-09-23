import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Button } from "../../components/common/Button";
import { NotificationList } from "../../components/notifications/NotificationList";
import { useNotifications } from "../../hooks/useNotifications";
import { markAllRead } from "../../services/notification.service";

export function NotificationsPage() {
  const query = useNotifications();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <ParticipantLayout title="Notifications">
      <Button variant="secondary" onClick={() => mutation.mutate()}>Mark all read</Button>
      <div className="mt-4"><NotificationList items={query.data ?? []} /></div>
    </ParticipantLayout>
  );
}
