import { Navigate, Outlet } from "react-router-dom";
import { useAuth, homeForRole } from "../context/AuthContext";
import type { Role } from "../types/auth";

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const assignedRoles = user.roles?.length ? user.roles : [user.role];
  if (!allow.some((role) => assignedRoles.includes(role))) {
    return <Navigate to={homeForRole(assignedRoles[0])} replace />;
  }
  return <Outlet />;
}
