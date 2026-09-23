import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/auth.service";
import type { AuthUser } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  hasRole: (...roles: AuthUser["role"][]) => boolean;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    preferredLanguage: "EN" | "TA" | "EN_TA";
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function homeForRole(role: AuthUser["role"]) {
  if (role === "ADMIN") return "/admin";
  if (role === "ORGANIZER") return "/organizer";
  return "/participant";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authService
      .refresh()
      .then((result) => setUser(result.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      hasRole: (...roles) => {
        const assignedRoles = user?.roles?.length ? user.roles : user ? [user.role] : [];
        return assignedRoles.some((role) => roles.includes(role));
      },
      hasPermission: (permission) => user?.permissions?.includes(permission) ?? false,
      login: async (email, password) => {
        const result = await authService.login(email, password);
        setUser(result.user);
        navigate(homeForRole(result.user.role));
        return result.user;
      },
      register: async (input) => {
        await authService.register(input);
        navigate("/verify-email");
      },
      logout: async () => {
        await authService.logout();
        setUser(null);
        navigate("/");
      },
    }),
    [user, loading, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
