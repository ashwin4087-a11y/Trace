import { describe, expect, it } from "vitest";
import { scoreWorkshop } from "../../../backend/src/shared/utils/recommendations";

describe("rule-based recommendations", () => {
  it("scores a workshop that matches domain, language, and skill", () => {
    const result = scoreWorkshop(
      {
        domain: "ENGINEERING",
        departmentName: "Computer Science",
        year: 1,
        skills: ["Linux"],
        interests: ["Cybersecurity"],
        language: "TA",
      },
      {
        id: "w1",
        domain: "ENGINEERING",
        departmentName: "Computer Science",
        level: "BEGINNER",
        language: "EN_TA",
        skills: ["Linux"],
        category: "Cybersecurity",
        title: "Linux Fundamentals",
      },
    );
    expect(result.score).toBeGreaterThanOrEqual(15);
    expect(result.reasons.join(" ")).toContain("Academic domain");
  });
});
