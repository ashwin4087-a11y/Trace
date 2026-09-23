export type Workshop = {
  id: string;
  title: string;
  description: string;
  category: string;
  domain: string;
  level: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  mode: string;
  capacity: number;
  waitlistEnabled: boolean;
  registrationDeadline: string;
  language: string;
  meetingUrl?: string | null;
  venue?: string | null;
  priceCents: number;
  currency: string;
  status: string;
  skills?: { skill: { name: string } }[];
  sessions?: SessionStub[];
  organizer?: { id: string; firstName: string; lastName: string };
  _count?: { registrations: number; sessions: number };
};

export type SessionStub = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  meetingUrl?: string | null;
  status: string;
};
