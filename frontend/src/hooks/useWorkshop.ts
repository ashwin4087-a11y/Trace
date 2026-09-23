import { useQuery } from "@tanstack/react-query";
import { getWorkshop, listWorkshops } from "../services/workshop.service";

export function useWorkshop(id?: string) {
  return useQuery({ queryKey: ["workshop", id], queryFn: () => getWorkshop(id!), enabled: Boolean(id) });
}

export function useWorkshopList(params?: Record<string, string | number | undefined>) {
  return useQuery({ queryKey: ["workshops", params], queryFn: () => listWorkshops(params) });
}
