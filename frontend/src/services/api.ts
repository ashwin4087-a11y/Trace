import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

type RetriableConfig = { _retry?: boolean; headers: Record<string, string>; url?: string };

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;
    const url = original?.url ?? "";
    if (error.response?.status !== 401 || !original || original._retry || url.includes("/auth/")) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshPromise ??= api
      .post("/auth/refresh")
      .then((response) => {
        const token = response.data.data.accessToken as string;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
    const token = await refreshPromise;
    if (!token) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

export async function unwrap<T>(response: Promise<{ data: { data: T } }> | { data: { data: T } }): Promise<T> {
  const resolved = await response;
  return resolved.data.data;
}
