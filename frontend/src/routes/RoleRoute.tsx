import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, homeForRole } from "../context/AuthContext";
import type { Role } from "../types/auth";

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }
  const assignedRoles = user.roles?.length ? user.roles : [user.role];
  if (!allow.some((role) => assignedRoles.includes(role))) {
    return <Navigate to={homeForRole(assignedRoles[0])} replace />;
  }
  return <Outlet />;
}
