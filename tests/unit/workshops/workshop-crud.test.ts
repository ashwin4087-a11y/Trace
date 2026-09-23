import { describe, expect, it } from "vitest";
import { createWorkshopSchema, updateWorkshopSchema, publishValidationSchema } from "../../../backend/src/modules/workshops/workshop.validation";

const validBody = {
  title: "Advanced React Patterns",
  slug: "advanced-react-patterns",
  description: "A deep dive into advanced React patterns and performance optimization.",
  shortDescription: "Advanced React patterns workshop",
  category: "Web Development",
  domain: "ENGINEERING" as const,
  level: "ADVANCED" as const,
  trainerName: "Dan A",
  startDate: "2026-10-10T10:00:00.000Z",
  endDate: "2026-10-10T15:00:00.000Z",
  durationHours: 5,
  mode: "ONLINE" as const,
  capacity: 100,
  registrationDeadline: "2026-10-09T10:00:00.000Z",
  language: "EN" as const,
  price: 50,
  priceCents: 5000,
  meetingUrl: "https://zoom.us/j/123",
};

const fullValidEntity = {
  ...validBody,
  startDate: new Date(validBody.startDate),
  endDate: new Date(validBody.endDate),
  registrationDeadline: new Date(validBody.registrationDeadline),
};

describe("workshop backend validation", () => {
  describe("createWorkshopSchema (Drafts)", () => {
    it("accepts a workshop payload with only a title (true draft)", () => {
      const result = createWorkshopSchema.safeParse({ body: { title: "Draft Workshop" } });
      expect(result.success).toBe(true);
    });

    it("rejects when start date is after end date (if provided)", () => {
      const result = createWorkshopSchema.safeParse({
        body: { ...validBody, startDate: "2026-10-11T10:00:00.000Z" }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Start date must be before end date/i);
      }
    });

    it("rejects when registration deadline is after start date (if provided)", () => {
      const result = createWorkshopSchema.safeParse({
        body: { ...validBody, registrationDeadline: "2026-10-11T10:00:00.000Z" }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Registration deadline cannot be after start date/i);
      }
    });

    it("rejects zero or negative capacity", () => {
      let result = createWorkshopSchema.safeParse({ body: { ...validBody, capacity: 0 } });
      expect(result.success).toBe(false);

      result = createWorkshopSchema.safeParse({ body: { ...validBody, capacity: -10 } });
      expect(result.success).toBe(false);
    });
  });

  describe("updateWorkshopSchema", () => {
    it("accepts partial updates", () => {
      const result = updateWorkshopSchema.safeParse({ body: { title: "New Title", price: 100 } });
      expect(result.success).toBe(true);
    });
  });

  describe("publishValidationSchema (Strict Publish Rules)", () => {
    it("accepts a fully populated valid workshop entity", () => {
      const result = publishValidationSchema.safeParse(fullValidEntity);
      expect(result.success).toBe(true);
    });

    it("rejects if required fields are missing", () => {
      const { title, description, domain, ...rest } = fullValidEntity;
      const result = publishValidationSchema.safeParse(rest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("rejects ONLINE workshops without meetingUrl", () => {
      const { meetingUrl, ...rest } = fullValidEntity;
      const result = publishValidationSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
    
    it("accepts OFFLINE workshops without meetingUrl", () => {
      const { meetingUrl, ...rest } = fullValidEntity;
      const result = publishValidationSchema.safeParse({ ...rest, mode: "OFFLINE" });
      expect(result.success).toBe(true);
    });
  });
});
