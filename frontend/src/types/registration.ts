import type { Workshop } from "./workshop";

export type Registration = {
  id: string;
  status: string;
  workshopId: string;
  workshop?: Workshop;
  order?: { id: string; status: string; amountCents: number; currency: string };
  user?: { id: string; email: string; firstName: string; lastName: string };
};
