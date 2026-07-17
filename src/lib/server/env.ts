const serverRequired = ["MONGODB_URI", "MONGODB_DB"] as const;

export function assertServerEnv() {
  const missing = serverRequired.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required server env: ${missing.join(", ")}`);
  }
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://meroestream.com"
  );
}
