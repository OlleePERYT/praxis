/** Subdomain-Label aus Host (z. B. demo aus demo.praxis-kennzahlen.de). */
export function getSubdomainFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;

  const hostname = hostHeader.split(":")[0].toLowerCase();
  const parts = hostname.split(".");

  if (hostname === "localhost" || parts.length < 3) {
    return null;
  }

  return parts[0] ?? null;
}
