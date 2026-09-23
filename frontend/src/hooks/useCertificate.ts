import { useQuery } from "@tanstack/react-query";
import { myCertificates } from "../services/certificate.service";

export function useCertificate() {
  return useQuery({ queryKey: ["certificates"], queryFn: myCertificates });
}
