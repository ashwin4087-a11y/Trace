import { useQuery } from "@tanstack/react-query";
import { myCertificates } from "../services/certificate.service";

export function useCertificate(workshopId?: string) {
  return useQuery({ 
    queryKey: ["certificates", workshopId], 
    queryFn: () => myCertificates(workshopId),
    enabled: !!workshopId 
  });
}
