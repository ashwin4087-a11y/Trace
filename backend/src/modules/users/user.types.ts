import type { AccountStatus, RoleName } from "@prisma/client";

export type UserListFilters = {
  page: number;
  pageSize: number;
  search?: string;
  role?: RoleName;
  status?: AccountStatus;
};
