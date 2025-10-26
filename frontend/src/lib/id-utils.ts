/**
 * Utility functions for generating and formatting IDs
 */

/**
 * Generate a short, readable ID from a UUID
 * Takes the first 8 characters of the UUID
 * @param uuid - The full UUID string
 * @returns A shortened version of the UUID (first 8 characters)
 */
export function shortId(uuid: string): string {
  return uuid.substring(0, 8).toUpperCase();
}

/**
 * Generate a human-readable ID with a prefix
 * @param uuid - The full UUID string
 * @param prefix - Optional prefix (e.g., 'PR' for Pickup Request)
 * @returns A formatted ID like "PR-A1B2C3D4"
 */
export function formatId(uuid: string, prefix = "PR"): string {
  return `${prefix}-${shortId(uuid)}`;
}

/**
 * Generate a nice ID for pickup requests
 * @param uuid - The full UUID string
 * @returns A formatted ID like "PR-A1B2C3D4"
 */
export function pickupRequestId(uuid: string): string {
  return formatId(uuid, "PR");
}

/**
 * Format UUID for display with ellipsis
 * @param uuid - The full UUID string
 * @param startChars - Number of characters to show at start (default: 8)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns A formatted string like "a1b2c3d4...5678"
 */
export function formatUuidWithEllipsis(
  uuid: string,
  startChars = 8,
  endChars = 4
): string {
  if (uuid.length <= startChars + endChars) {
    return uuid;
  }
  return `${uuid.substring(0, startChars)}...${uuid.substring(
    uuid.length - endChars
  )}`;
}
