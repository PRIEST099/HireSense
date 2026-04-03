const BLOCKED_IP_PATTERNS = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^169\.254\./, /^0\./, /^::1$/, /^fc00:/, /^fe80:/, /^fd/,
];

const BLOCKED_HOSTNAMES = [
  "metadata.google.internal",
  "metadata.google",
  "169.254.169.254",
];

// Cloud storage domains that serve files (not necessarily with .pdf extension)
const ALLOWED_CLOUD_HOSTS = [
  "drive.google.com",
  "docs.google.com",
  "drive.usercontent.google.com",
  "www.dropbox.com",
  "dl.dropboxusercontent.com",
  "onedrive.live.com",
  "1drv.ms",
  "github.com",
  "raw.githubusercontent.com",
  "storage.googleapis.com",
  "s3.amazonaws.com",
  "blob.core.windows.net",
];

/**
 * Converts cloud storage share links to direct download URLs
 */
export function resolveCloudUrl(url: string): string {
  const parsed = new URL(url);

  // Google Drive: https://drive.google.com/file/d/FILE_ID/view → direct download
  // Use drive.usercontent.google.com to skip the redirect chain and virus scan page
  if (parsed.hostname === "drive.google.com" && parsed.pathname.includes("/file/d/")) {
    const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (match) {
      return `https://drive.usercontent.google.com/download?id=${match[1]}&export=download`;
    }
  }

  // Google Drive open link: https://drive.google.com/open?id=FILE_ID
  if (parsed.hostname === "drive.google.com" && parsed.searchParams.has("id")) {
    return `https://drive.usercontent.google.com/download?id=${parsed.searchParams.get("id")}&export=download`;
  }

  // Google Drive uc export link: https://drive.google.com/uc?export=download&id=FILE_ID
  if (parsed.hostname === "drive.google.com" && parsed.pathname === "/uc" && parsed.searchParams.has("id")) {
    return `https://drive.usercontent.google.com/download?id=${parsed.searchParams.get("id")}&export=download`;
  }

  // Dropbox: change dl=0 to dl=1 for direct download
  if (parsed.hostname === "www.dropbox.com") {
    parsed.searchParams.set("dl", "1");
    return parsed.toString();
  }

  // OneDrive: append download parameter
  if (parsed.hostname === "onedrive.live.com" || parsed.hostname === "1drv.ms") {
    if (!parsed.searchParams.has("download")) {
      parsed.searchParams.set("download", "1");
    }
    return parsed.toString();
  }

  return url;
}

export function validateResumeUrl(url: string): { valid: boolean; error?: string; resolvedUrl?: string } {
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

  // Check if it's a known cloud storage host (doesn't need .pdf extension)
  const isCloudHost = ALLOWED_CLOUD_HOSTS.some(
    (host) => parsed.hostname === host || parsed.hostname.endsWith("." + host)
  );

  // If not a cloud host, require .pdf extension
  if (!isCloudHost && !parsed.pathname.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "URL must point to a PDF file (.pdf), or use a supported cloud storage link (Google Drive, Dropbox, OneDrive)" };
  }

  // Resolve cloud URLs to direct download links
  const resolvedUrl = resolveCloudUrl(url);

  return { valid: true, resolvedUrl };
}
