import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "../services/notification.service";
import { useAuth } from "../context/AuthContext";

export function useNotifications() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    enabled: !loading && Boolean(user),
  });
}
