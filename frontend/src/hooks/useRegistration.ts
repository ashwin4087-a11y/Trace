import { useQuery } from "@tanstack/react-query";
import { myRegistrations } from "../services/registration.service";

export function useRegistration() {
  return useQuery({ queryKey: ["my-registrations"], queryFn: myRegistrations });
}
