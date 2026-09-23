export type WorkshopDomainEvent =
  | { 
      type: "WORKSHOP_PUBLISHED"; 
      workshopId: string; 
      title: string;
      domain: string;
      departmentId: string | null;
      language: string;
      skills: string[];
      startDate: string;
      publishedAt: string;
    }
  | { type: "REGISTRATION_CONFIRMED"; userId: string; workshopId: string; workshopTitle: string }
  | { type: "CERTIFICATE_ISSUED"; userId: string; workshopTitle: string; certificateCode: string }
  | {
      type: "ANNOUNCEMENT_PUBLISHED";
      workshopId: string;
      title: string;
      body: string;
      recipientUserIds: string[];
    }
  | {
      type: "ATTENDANCE_UPDATED";
      attendanceId: string;
      sessionId: string;
      workshopId: string;
      registrationId: string;
      userId: string;
      status: string;
      updatedAt: Date;
      source: string;
    };

type Handler = (event: WorkshopDomainEvent) => Promise<void>;

const handlers: Handler[] = [];

/** Member 3 registers listeners. Workshop modules only emit. */
export function onWorkshopDomainEvent(handler: Handler) {
  handlers.push(handler);
  return () => {
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  };
}

export async function emitWorkshopDomainEvent(event: WorkshopDomainEvent) {
  for (const handler of handlers) {
    await handler(event);
  }
}
