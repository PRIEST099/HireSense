const BLOCKED_IP_PATTERNS = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^169\.254\./, /^0\./, /^::1$/, /^fc00:/, /^fe80:/, /^fd/,
];

const BLOCKED_HOSTNAMES = [
  "metadata.google.internal",
  "metadata.google",
  "169.254.169.254",
];

export function validateResumeUrl(url: string): { valid: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  // Scheme check: https required, http allowed only in dev for localhost
  const isDev = process.env.NODE_ENV === "development";
  if (parsed.protocol === "http:") {
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isDev || !isLocalhost) {
      return { valid: false, error: "Only HTTPS URLs are allowed" };
    }
  } else if (parsed.protocol !== "https:") {
    return { valid: false, error: "Only HTTPS URLs are allowed" };
  }

  // Block private/internal IPs
  if (BLOCKED_HOSTNAMES.includes(parsed.hostname)) {
    return { valid: false, error: "This URL is not allowed" };
  }
  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(parsed.hostname)) {
      return { valid: false, error: "This URL is not allowed" };
    }
  }

  // Must be a PDF
  if (!parsed.pathname.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "URL must point to a PDF file (.pdf)" };
  }

  return { valid: true };
}
