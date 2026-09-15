import "server-only";

// Server entry point for Google ID token verification. The implementation lives
// in ./google-verify (no `server-only` guard) so it can be unit-tested directly.
export {
  verifyGoogleIdToken,
  googleClientId,
  googleSignInConfigured,
} from "./google-verify";
export type { GoogleIdentity } from "./google-verify";
