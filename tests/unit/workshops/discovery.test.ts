import { describe, it, expect } from "vitest";
import { buildDiscoveryQuery } from "../../../backend/src/modules/workshops/workshop.query-builder";
import type { AuthUser } from "../../../backend/src/shared/types/http";

describe("Workshop Discovery Query Builder", () => {
  const participant: AuthUser = { id: "p1", email: "p@example.com", role: "PARTICIPANT", firstName: "P", lastName: "1" };
  const organizer: AuthUser = { id: "o1", email: "o@example.com", role: "ORGANIZER", firstName: "O", lastName: "1" };
  const admin: AuthUser = { id: "a1", email: "a@example.com", role: "ADMIN", firstName: "A", lastName: "1" };
  const baseQuery = { page: 1, pageSize: 20 };

  describe("Visibility Rules", () => {
    it("1. Unauthenticated users see only public statuses", () => {
      const { where } = buildDiscoveryQuery(undefined, baseQuery);
      expect(where.status).toEqual({ in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] });
    });

    it("2. Participants see only public statuses", () => {
      const { where } = buildDiscoveryQuery(participant, baseQuery);
      expect(where.status).toEqual({ in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] });
    });

    it("3. Organizers see public statuses by default", () => {
      const { where } = buildDiscoveryQuery(organizer, baseQuery);
      expect(where.status).toEqual({ in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] });
    });

    it("4. Organizers see all their own workshops when mine=true", () => {
      const { where } = buildDiscoveryQuery(organizer, { ...baseQuery, mine: true });
      expect(where.organizerId).toBe("o1");
      expect(where.status).toBeUndefined(); // Should see all statuses
    });

    it("5. Admins see all workshops by default", () => {
      const { where } = buildDiscoveryQuery(admin, baseQuery);
      expect(where.status).toBeUndefined();
    });

    it("6. Explicit status filter works for participants if valid", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, status: "ONGOING" });
      expect(where.status).toBe("ONGOING");
    });

    it("7. Explicit status filter is overridden for participants if invalid (e.g. DRAFT)", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, status: "DRAFT" });
      expect(where.status).toEqual({ in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED"] });
    });
  });

  describe("Filtering", () => {
    it("8. Filters by domain", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, domain: "ENGINEERING" });
      expect(where.domain).toBe("ENGINEERING");
    });

    it("9. Filters by departmentId", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, departmentId: "d1" });
      expect(where.departmentId).toBe("d1");
    });

    it("10. Filters by category", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, category: "Tech" });
      expect(where.category).toBe("Tech");
    });

    it("11. Filters by language", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, language: "EN" });
      expect(where.language).toBe("EN");
    });

    it("12. Filters by mode", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, mode: "ONLINE" });
      expect(where.mode).toBe("ONLINE");
    });

    it("13. Filters by level", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, level: "BEGINNER" });
      expect(where.level).toBe("BEGINNER");
    });

    it("14. Filters by exact price (free)", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, price: "free" });
      expect(where.priceCents).toBe(0);
    });

    it("15. Filters by exact price (paid)", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, price: "paid" });
      expect(where.priceCents).toEqual({ gt: 0 });
    });

    it("16. Filters by certificate availability (true)", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, certificateEnabled: "true" });
      expect(where.certificateEnabled).toBe(true);
    });

    it("17. Filters by certificate availability (false)", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, certificateEnabled: "false" });
      expect(where.certificateEnabled).toBe(false);
    });

    it("18. Filters by date (upcoming)", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, date: "upcoming" });
      expect(where.startDate).toBeDefined();
    });
  });

  describe("Search", () => {
    it("21. Searches across multiple fields", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, search: "React" });
      expect(where.OR).toBeDefined();
      expect(where.OR).toHaveLength(6);
    });

    it("22. Search handles special characters", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, search: "C++" });
      expect(where.OR?.[0]).toEqual({ title: { contains: "C++", mode: "insensitive" } });
    });
  });

  describe("Skills Filter", () => {
    it("23. Filters by single skill", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, skills: "React" });
      expect(where.AND).toBeDefined();
    });

    it("24. Filters by multiple skills", () => {
      const { where } = buildDiscoveryQuery(participant, { ...baseQuery, skills: "React, Node.js" });
      expect(Array.isArray(where.AND)).toBe(true);
      expect((where.AND as any).length).toBe(2);
    });
  });

  describe("Sorting", () => {
    it("25. Sorts by newest", () => {
      const { orderBy } = buildDiscoveryQuery(participant, { ...baseQuery, sort: "newest" });
      expect(orderBy).toEqual([{ createdAt: "desc" }]);
    });

    it("26. Sorts by upcoming", () => {
      const { orderBy } = buildDiscoveryQuery(participant, { ...baseQuery, sort: "upcoming" });
      expect(orderBy).toEqual([{ startDate: "asc" }]);
    });

    it("27. Sorts by date (descending) correctly translates date sort to asc", () => {
      const { orderBy } = buildDiscoveryQuery(participant, { ...baseQuery, sort: "date" });
      expect(orderBy).toEqual([{ startDate: "asc" }]);
    });

    it("28. Sorts by price low to high", () => {
      const { orderBy } = buildDiscoveryQuery(participant, { ...baseQuery, sort: "price-low-to-high" });
      expect(orderBy).toEqual([{ priceCents: "asc" }]);
    });

    it("29. Sorts by price high to low", () => {
      const { orderBy } = buildDiscoveryQuery(participant, { ...baseQuery, sort: "price-high-to-low" });
      expect(orderBy).toEqual([{ priceCents: "desc" }]);
    });
    
    it("30. Default sort is upcoming", () => {
      const { orderBy } = buildDiscoveryQuery(participant, baseQuery);
      expect(orderBy).toEqual([{ startDate: "asc" }]);
    });
  });
});
