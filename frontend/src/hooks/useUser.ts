import { useQuery } from "@tanstack/react-query";

export function useUserQuery<T>(key: string[], queryFn: () => Promise<T>, enabled = true) {
  return useQuery({ queryKey: key, queryFn, enabled });
}
