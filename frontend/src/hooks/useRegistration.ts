import { useQuery } from "@tanstack/react-query";
import { myRegistrations } from "../services/registration.service";
import { useAuth } from "../context/AuthContext";

export function useRegistration() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["my-registrations"],
    queryFn: myRegistrations,
    enabled: !loading && Boolean(user),
  });
}
