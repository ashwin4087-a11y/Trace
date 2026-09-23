const allowedHosts = ["meet.google.com", "zoom.us", "teams.microsoft.com", "teams.live.com"];

export function normalizeMeetingUrl(url: string | null | undefined): {
  url: string | null;
  provider: string | null;
} {
  if (!url) return { url: null, provider: null };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Meeting URL is invalid");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Meeting URL must use https");
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const provider = allowedHosts.find((item) => host === item || host.endsWith(`.${item}`)) ?? "external";
  return { url: parsed.toString(), provider };
}
