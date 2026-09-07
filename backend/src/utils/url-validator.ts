import { AppError } from "./AppError";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "metadata.google.internal",
  "169.254.169.254"
]);

/**
 * Validates a target application URL for protocol safety and SSRF prevention.
 */
export function validateTargetUrl(rawUrl: string): URL {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new AppError("Invalid URL provided", 400);
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new AppError("Malformed URL format", 400);
  }

  // Protocol validation: Strictly permit HTTP and HTTPS
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError(
      `Unsupported protocol '${parsed.protocol}'. Only http:// and https:// URLs are permitted.`,
      400
    );
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check for cloud metadata IP (always strictly blocked)
  if (hostname === "169.254.169.254") {
    throw new AppError("Access to cloud metadata endpoints is prohibited.", 403);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const allowLocalUrls = process.env.ALLOW_LOCAL_URLS === "true";

  // In production (or unless explicitly allowed for local testing), block loopback & private networks
  if (isProduction || !allowLocalUrls) {
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      if (isProduction) {
        throw new AppError(
          "Access to localhost and loopback interfaces is prohibited in production.",
          403
        );
      }
    }

    // Check private IPv4 ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    if (isProduction && isPrivateIp(hostname)) {
      throw new AppError(
        "Access to private internal network addresses is prohibited in production.",
        403
      );
    }
  }

  return parsed;
}

function isPrivateIp(hostname: string): boolean {
  // Simple check for private IPv4 addresses
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (!match) return false;

  const octets = match.slice(1).map(Number);
  if (octets.some((o) => o > 255)) return false;

  // 10.0.0.0 - 10.255.255.255
  if (octets[0] === 10) return true;

  // 172.16.0.0 - 172.31.255.255
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;

  // 192.168.0.0 - 192.168.255.255
  if (octets[0] === 192 && octets[1] === 168) return true;

  // 127.0.0.0/8
  if (octets[0] === 127) return true;

  // 169.254.0.0/16 Link-local
  if (octets[0] === 169 && octets[1] === 254) return true;

  return false;
}
