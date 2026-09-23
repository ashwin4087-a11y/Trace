import { describe, expect, it } from "vitest";
import { validateUserId, validateWorkshopDraft, type WorkshopDraftInput } from "../../../frontend/src/utils/workshop-form";
import { emptyWorkshopForm } from "../../../frontend/src/components/workshops/WorkshopForm";

const valid: WorkshopDraftInput = {
  ...emptyWorkshopForm,
  title: "Linux Fundamentals",
  description: "A hands-on workshop for the shell and permissions.",
  category: "Cybersecurity",
  trainerName: "Meena",
  startDate: "2026-10-01T10:00",
  endDate: "2026-10-01T13:00",
  registrationDeadline: "2026-09-30T10:00",
  durationHours: "3",
  capacity: "30",
  price: "0",
  priceCents: "0",
  meetingUrl: "https://meet.google.com/abc-defg-hij",
};

describe("workshop form validation", () => {
  it("accepts a complete draft", () => {
    expect(validateWorkshopDraft(valid)).toBeNull();
  });

  it("rejects a deadline after the start", () => {
    expect(validateWorkshopDraft({ ...valid, registrationDeadline: "2026-10-02T10:00" })).toMatch(/Registration must close at or before/i);
  });
  
  it("rejects an end date before the start date", () => {
    expect(validateWorkshopDraft({ ...valid, endDate: "2026-09-30T10:00" })).toMatch(/End must be after the start/i);
  });

  it("rejects negative capacity or zero capacity", () => {
    expect(validateWorkshopDraft({ ...valid, capacity: "0" })).toMatch(/Capacity must be a positive integer/i);
    expect(validateWorkshopDraft({ ...valid, capacity: "-5" })).toMatch(/Capacity must be a positive integer/i);
  });

  it("accepts positive capacity", () => {
    expect(validateWorkshopDraft({ ...valid, capacity: "50" })).toBeNull();
  });

  it("rejects negative price", () => {
    expect(validateWorkshopDraft({ ...valid, price: "-10" })).toMatch(/Price cannot be negative/i);
    expect(validateWorkshopDraft({ ...valid, priceCents: "-1000" })).toMatch(/Price cents cannot be negative/i);
  });

  it("accepts zero or positive price", () => {
    expect(validateWorkshopDraft({ ...valid, price: "100", priceCents: "10000" })).toBeNull();
    expect(validateWorkshopDraft({ ...valid, price: "0", priceCents: "0" })).toBeNull();
  });

  it("rejects a non-uuid participant id", () => {
    expect(validateUserId("student-1")).toMatch(/user id/i);
  });
});
