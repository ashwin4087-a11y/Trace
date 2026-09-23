import { describe, expect, it } from "vitest";
import { emitWorkshopDomainEvent, onWorkshopDomainEvent } from "../../../backend/src/modules/workshops/workshop.events";

describe("workshop domain events", () => {
  it("delivers a publish event without knowing who listens", async () => {
    const seen: string[] = [];
    const unsubscribe = onWorkshopDomainEvent(async (event) => {
      if (event.type === "WORKSHOP_PUBLISHED") seen.push(event.workshopId);
    });
    await emitWorkshopDomainEvent({ type: "WORKSHOP_PUBLISHED", workshopId: "w1", title: "Linux" });
    unsubscribe();
    await emitWorkshopDomainEvent({ type: "WORKSHOP_PUBLISHED", workshopId: "w2", title: "Linux" });
    expect(seen).toEqual(["w1"]);
  });
});
