// Key functionality: Utilities to sanitize phone input and format to US E.164 (+1XXXXXXXXXX).

/** Strip all non-digit characters from a phone-like string. */
export function stripToDigits(input: string): string {
  return input.replace(/\D+/g, '')
}

/**
 * Format a US phone number to E.164. Returns null if it cannot be normalized.
 * Accepts inputs like "(415) 555-2671", "415.555.2671", "1-415-555-2671", or plain digits.
 * Rules:
 * - 10 digits -> "+1" + 10 digits
 * - 11 digits starting with "1" -> "+1" + last 10 digits
 */
export function formatUSPhoneToE164(input: string): string | null {
  const digits = stripToDigits(input)
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+1${digits.slice(1)}`
  return null
}

/** Validate E.164 phone number format. */
export function isE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone)
}


