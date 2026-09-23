import { api, setAccessToken, unwrap } from "./api";
import type { AuthUser } from "../types/auth";

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage: "EN" | "TA" | "EN_TA";
}) {
  return unwrap<AuthUser>(await api.post("/auth/register", input));
}

export async function login(email: string, password: string) {
  const result = await unwrap<{ accessToken: string; user: AuthUser }>(api.post("/auth/login", { email, password }));
  setAccessToken(result.accessToken);
  return result;
}

export async function refresh() {
  const result = await unwrap<{ accessToken: string; user: AuthUser }>(api.post("/auth/refresh"));
  setAccessToken(result.accessToken);
  return result;
}

export async function logout() {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function verifyEmail(token: string) {
  return unwrap<{ verified: boolean }>(await api.post("/auth/verify-email", { token }));
}

export async function forgotPassword(email: string) {
  return unwrap<{ accepted: boolean }>(await api.post("/auth/forgot-password", { email }));
}

export async function resetPassword(token: string, password: string) {
  return unwrap<{ reset: boolean }>(await api.post("/auth/reset-password", { token, password }));
}

export async function me() {
  return unwrap<AuthUser>(await api.get("/auth/me"));
}
