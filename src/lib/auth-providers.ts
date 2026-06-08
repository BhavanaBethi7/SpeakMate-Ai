export function isGoogleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET);
}
