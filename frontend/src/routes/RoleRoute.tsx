import { Navigate, Outlet } from "react-router-dom";
import { useAuth, homeForRole } from "../context/AuthContext";
import type { Role } from "../types/auth";

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <Outlet />;
}
