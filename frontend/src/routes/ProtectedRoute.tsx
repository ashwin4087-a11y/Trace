import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "../components/common/Loader";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8"><Loader /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
