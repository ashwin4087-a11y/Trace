import { describe, expect, it } from "vitest";
import { toPublicUser } from "../../../backend/src/modules/auth/auth.service";
import { listUsersSchema, roleSchema, statusSchema, updateUserSchema } from "../../../backend/src/modules/users/user.validation";

describe("user management validation", () => {
  it("accepts supported filters and lifecycle statuses", () => {
    const result = listUsersSchema.safeParse({
      query: { page: "1", pageSize: "20", role: "ADMIN", status: "DEACTIVATED" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects arbitrary roles and invalid user fields", () => {
    expect(roleSchema.safeParse({ body: { role: "OWNER" } }).success).toBe(false);
    expect(updateUserSchema.safeParse({ body: { phone: "x" } }).success).toBe(false);
  });

  it("accepts explicit status transitions", () => {
    expect(statusSchema.safeParse({ body: { status: "ACTIVE" } }).success).toBe(true);
    expect(statusSchema.safeParse({ body: { status: "DEACTIVATED" } }).success).toBe(true);
  });
});

describe("safe administrative user projection", () => {
  it("does not expose authentication secrets", () => {
    const user = toPublicUser(
      {
        id: "user-1",
        name: "Aurex Admin",
        email: "admin@example.test",
        passwordHash: "never-return-this",
        firstName: "Aurex",
        lastName: "Admin",
        role: "ADMIN",
        status: "ACTIVE",
        phone: null,
        emailVerified: true,
        emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
        preferredLanguage: "EN",
        organizationId: null,
        departmentId: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      } as never,
      [],
    );

    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("refreshTokens");
    expect(user).not.toHaveProperty("passwordResetTokens");
    expect(user).not.toHaveProperty("emailVerificationTokens");
    expect(user.email).toBe("admin@example.test");
    expect(user.roles).toEqual(["ADMIN"]);
  });
});
