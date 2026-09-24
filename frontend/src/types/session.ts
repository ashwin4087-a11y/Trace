export type WorkshopSession = {
  id: string;
  workshopId: string;
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  trainerName?: string | null;
  meetingUrl?: string | null;
  recordingUrl?: string | null;
  venue?: string | null;
  status: string;
  mode?: string;
  sessionNumber?: number;
  meetingLive?: boolean;
};
