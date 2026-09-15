// Practical email format check. Accepts all legitimate providers (Gmail, Yahoo,
// Outlook, Hotmail, iCloud, custom domains, …) while rejecting malformed input:
//   name@gmail      -> no TLD after the domain            (rejected)
//   name@           -> no domain                          (rejected)
//   name.com        -> no "@"                             (rejected)
//   "name @gmail.com" (leading/embedded space)            (rejected)
// The local part and domain may not contain whitespace or "@", the domain must
// contain at least one dot, and the TLD must be at least two letters.
export const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Standard, user-facing message for an invalid email address. */
export const EMAIL_INVALID_MESSAGE = "Invalid email. Please enter a valid email address.";

export function isValidEmail(email: string): boolean {
  const value = email.trim();
  // Guard against pathological lengths and consecutive dots in the domain.
  if (value.length > 254) return false;
  if (/\.\./.test(value)) return false;
  return EMAIL_RE.test(value);
}

/** Normalize an email for storage / lookup (trim + lowercase). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function clampString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

export function asBoolean(value: unknown): boolean {
  return value === true;
}
