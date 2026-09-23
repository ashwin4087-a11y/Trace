import { describe, expect, it } from "vitest";
import { devMockAllowed, mockUserFromEnv } from "../../../backend/src/shared/auth/dev-user.adapter";

describe("development user adapter", () => {
  it("stays off in production even when the flag is set", () => {
    expect(devMockAllowed({ nodeEnv: "production", flag: "true" })).toBe(false);
    expect(
      mockUserFromEnv({
        NODE_ENV: "production",
        DEV_MOCK_USER: "true",
        DEV_MOCK_USER_ID: "11111111-1111-4111-8111-111111111111",
        DEV_MOCK_USER_ROLE: "ORGANIZER",
      }),
    ).toBeNull();
  });

  it("returns an existing user id only when development mock is explicit", () => {
    const user = mockUserFromEnv({
      NODE_ENV: "development",
      DEV_MOCK_USER: "true",
      DEV_MOCK_USER_ID: "11111111-1111-4111-8111-111111111111",
      DEV_MOCK_USER_ROLE: "ORGANIZER",
      DEV_MOCK_USER_EMAIL: "organizer@aurex.local",
    });
    expect(user?.role).toBe("ORGANIZER");
    expect(user?.id).toBe("11111111-1111-4111-8111-111111111111");
  });
});
