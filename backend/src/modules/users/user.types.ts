import type { AccountStatus, UserRole } from "@prisma/client";

export type UserListFilters = {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  status?: AccountStatus;
};
