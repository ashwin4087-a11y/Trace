import type { AuthUser } from "./auth";

type Membership = { id: string; name: string; code: string; status: string } | null;

export type UserRecord = AuthUser & {
	organization?: Membership;
	department?: Membership;
	memberships?: Array<{
		organization: Membership;
		department: Membership;
	}>;
};
