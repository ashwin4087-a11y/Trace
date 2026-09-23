import { describe, it } from "vitest";

/**
 * Full certificate persistence is exercised against PostgreSQL, not in this file.
 * The 90% rule itself is covered by tests/unit/certificates/eligibility.test.ts.
 */
describe("certificate integration", () => {
  it.skip("persists a certificate only after server-side attendance is at least 90%", () => {
    // Requires DATABASE_URL, migrations, and the seed accounts.
  });
});
