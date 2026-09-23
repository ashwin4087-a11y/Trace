import { describe, expect, it, beforeEach, vi } from "vitest";
import { prisma } from "../../../src/config/database";
import { 
  createSession, 
  updateSession, 
  deleteSession, 
  getSessionAccess 
} from "../../../src/modules/sessions/session.service";
import { ApiError } from "../../../src/shared/errors/api-error";

vi.mock("../../../src/config/database", () => ({
  prisma: {
    workshop: { findUnique: vi.fn(), count: vi.fn() },
    workshopSession: { 
      findFirst: vi.fn(), 
      create: vi.fn(), 
      update: vi.fn(), 
      delete: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn() 
    },
    registration: { findUnique: vi.fn() },
    attendance: { count: vi.fn() }
  }
}));

describe("Session Management and Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const authUser = (role: any, id = "user1") => ({ id, email: "u@u.com", role });

  describe("Session Creation & Validation", () => {
    it("should reject creation if not organizer or admin", async () => {
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({ organizerId: "org2" });
      await expect(createSession(authUser("ORGANIZER", "org1"), {
        workshopId: "w1", title: "S1", sessionDate: "2026-10-10T00:00:00Z", startTime: "2026-10-10T10:00:00Z", endTime: "2026-10-10T11:00:00Z", mode: "ONLINE", meetingUrl: "https://meet.google.com/abc"
      })).rejects.toThrow(/You can only manage your own workshops/);
    });

    it("should reject if end time is before start time", async () => {
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({ organizerId: "org1" });
      await expect(createSession(authUser("ORGANIZER", "org1"), {
        workshopId: "w1", title: "S1", sessionDate: "2026-10-10T00:00:00Z", startTime: "2026-10-10T11:00:00Z", endTime: "2026-10-10T10:00:00Z", mode: "ONLINE", meetingUrl: "https://meet.google.com/abc"
      })).rejects.toThrow("End time must be after start time");
    });

    it("should reject if session overlaps with an existing one", async () => {
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({ organizerId: "org1" });
      (prisma.workshopSession.findFirst as any).mockResolvedValueOnce({ id: "s-overlap" });
      
      await expect(createSession(authUser("ORGANIZER", "org1"), {
        workshopId: "w1", title: "S1", sessionDate: "2026-10-10T00:00:00Z", startTime: "2026-10-10T10:00:00Z", endTime: "2026-10-10T11:00:00Z", mode: "OFFLINE", venue: "Room 1"
      })).rejects.toThrow("Session overlaps with an existing session in this workshop");
    });

    it("should reject ONLINE session with invalid meeting URL", async () => {
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({ organizerId: "org1" });
      (prisma.workshopSession.findFirst as any).mockResolvedValueOnce(null);
      await expect(createSession(authUser("ORGANIZER", "org1"), {
        workshopId: "w1", title: "S1", sessionDate: "2026-10-10T00:00:00Z", startTime: "2026-10-10T10:00:00Z", endTime: "2026-10-10T11:00:00Z", mode: "ONLINE", meetingUrl: "not-a-url"
      })).rejects.toThrow(/Meeting URL is invalid|Invalid URL/);
    });

    it("should create session and automatically assign next sessionNumber", async () => {
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({ organizerId: "org1" });
      (prisma.workshopSession.findFirst as any).mockResolvedValueOnce(null);
      (prisma.workshopSession.count as any).mockResolvedValueOnce(3); // 3 existing sessions
      (prisma.workshopSession.create as any).mockResolvedValueOnce({ id: "new-s" });

      await createSession(authUser("ORGANIZER", "org1"), {
        workshopId: "w1", title: "S1", sessionDate: "2026-10-10T00:00:00Z", startTime: "2026-10-10T10:00:00Z", endTime: "2026-10-10T11:00:00Z", mode: "HYBRID", meetingUrl: "https://meet.google.com/abc", venue: "Room 1"
      });
      
      expect(prisma.workshopSession.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ sessionNumber: 4 })
      }));
    });
  });

  describe("Session Update & Delete", () => {
    it("should reject delete if attendance exists", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({ id: "s1", workshopId: "w1" });
      (prisma.workshop.findUnique as any).mockResolvedValueOnce({ organizerId: "org1" });
      (prisma.attendance.count as any).mockResolvedValueOnce(5); // attendance records exist

      await expect(deleteSession(authUser("ORGANIZER", "org1"), "s1")).rejects.toThrow("Cannot delete a session that already has attendance records. Cancel it instead.");
    });
  });

  describe("Session Access Security", () => {
    it("should allow access to CONFIRMED participant and provide meetingUrl", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({
        id: "s1", workshopId: "w1", status: "SCHEDULED", meetingUrl: "https://zoom.us/j/123", mode: "ONLINE", workshop: { organizerId: "org1" }
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ status: "CONFIRMED" });

      const access = await getSessionAccess(authUser("PARTICIPANT", "p1"), "s1");
      expect(access.meetingUrl).toBe("https://zoom.us/j/123");
    });

    it("should DENY access to PENDING_PAYMENT participant", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({
        id: "s1", workshopId: "w1", status: "SCHEDULED", workshop: { organizerId: "org1" }
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ status: "PENDING_PAYMENT" });

      await expect(getSessionAccess(authUser("PARTICIPANT", "p1"), "s1")).rejects.toThrow("You do not have access to this session's meeting information");
    });

    it("should DENY access to WAITLISTED participant", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({
        id: "s1", workshopId: "w1", status: "SCHEDULED", workshop: { organizerId: "org1" }
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ status: "WAITLISTED" });

      await expect(getSessionAccess(authUser("PARTICIPANT", "p1"), "s1")).rejects.toThrow("You do not have access to this session's meeting information");
    });

    it("should DENY access to CANCELLED participant", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({
        id: "s1", workshopId: "w1", status: "SCHEDULED", workshop: { organizerId: "org1" }
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ status: "CANCELLED" });

      await expect(getSessionAccess(authUser("PARTICIPANT", "p1"), "s1")).rejects.toThrow("You do not have access to this session's meeting information");
    });

    it("should DENY access to unregistered user", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({
        id: "s1", workshopId: "w1", status: "SCHEDULED", workshop: { organizerId: "org1" }
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce(null);

      await expect(getSessionAccess(authUser("PARTICIPANT", "p1"), "s1")).rejects.toThrow("You do not have access to this session's meeting information");
    });
    
    it("should allow access to Organizer of the workshop", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({
        id: "s1", workshopId: "w1", status: "SCHEDULED", meetingUrl: "https://zoom.us/j/123", mode: "ONLINE", workshop: { organizerId: "org1" }
      });
      // Organizer registration is null
      (prisma.registration.findUnique as any).mockResolvedValueOnce(null);

      const access = await getSessionAccess(authUser("ORGANIZER", "org1"), "s1");
      expect(access.meetingUrl).toBe("https://zoom.us/j/123");
    });
    
    it("should only return recordingUrl if session status is COMPLETED", async () => {
      (prisma.workshopSession.findUnique as any).mockResolvedValueOnce({
        id: "s1", workshopId: "w1", status: "SCHEDULED", recordingUrl: "https://youtube.com/xyz", workshop: { organizerId: "org1" }
      });
      (prisma.registration.findUnique as any).mockResolvedValueOnce({ status: "CONFIRMED" });

      const access = await getSessionAccess(authUser("PARTICIPANT", "p1"), "s1");
      expect(access.recordingUrl).toBeNull(); // Because it's SCHEDULED, not COMPLETED
    });
  });
});
