import { headers } from "next/headers";

/** Strip trailing slash for building URLs. */
function stripTrailingSlash(s: string) {
  return s.replace(/\/$/, "");
}

/**
 * Origin used in Auth email links (reset, signup confirm).
 * Prefer NEXT_PUBLIC_SITE_URL; on Vercel fall back to VERCEL_URL / request Host
 * so redirectTo is allowed when the env var was never set.
 */
export async function resolvePublicOrigin(): Promise<{
  origin: string;
  usedEnvOverride: boolean;
  usedRequestFallback: boolean;
}> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return {
      origin: stripTrailingSlash(fromEnv),
      usedEnvOverride: true,
      usedRequestFallback: false,
    };
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const host = vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return {
      origin: `https://${host}`,
      usedEnvOverride: false,
      usedRequestFallback: true,
    };
  }

  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim();
  if (!host) {
    return {
      origin: "http://localhost:3000",
      usedEnvOverride: false,
      usedRequestFallback: false,
    };
  }

  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.includes(".local");

  const protoHeader = h.get("x-forwarded-proto")?.split(",")[0].trim();
  const proto =
    protoHeader ?? (isLocal ? "http" : "https");

  return {
    origin: stripTrailingSlash(`${proto}://${host}`),
    usedEnvOverride: false,
    usedRequestFallback: true,
  };
}
