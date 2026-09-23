export type AttendanceSummary = { attended: number; total: number; percentage: number };
export type AttendanceRecord = {
  id: string;
  status: string;
  method: string;
  session?: { id: string; title: string; workshop?: { id: string; title: string } };
  user?: { id: string; firstName: string; lastName: string; email: string };
};
