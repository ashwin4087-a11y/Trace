import { useQuery } from "@tanstack/react-query";
import { myAttendance, summary } from "../services/attendance.service";

export function useAttendance(workshopId?: string) {
  const history = useQuery({ queryKey: ["attendance", workshopId], queryFn: () => myAttendance(workshopId), enabled: Boolean(workshopId) });
  const percent = useQuery({
    queryKey: ["attendance-summary", workshopId],
    queryFn: () => summary(workshopId!),
    enabled: Boolean(workshopId),
  });
  return { history, percent };
}
