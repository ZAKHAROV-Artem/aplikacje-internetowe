/**
 * Converts a time string to 24-hour format (HH:MM)
 * @param time - Time string in various formats (HH:MM, H:MM, etc.)
 * @returns Time string in 24-hour format (HH:MM)
 */
export function formatTimeTo24h(time: string): string {
  if (!time) return '00:00';
  
  // If already in 24h format (HH:MM), return as is
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }
  
  // Parse AM/PM format
  const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Try to parse as simple HH:MM
  const simpleMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const hours = parseInt(simpleMatch[1], 10);
    const minutes = simpleMatch[2];
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  return '00:00';
}

/**
 * Converts a time string to AM/PM format with long format (e.g., "8:00 AM")
 * @param time - Time string in 24-hour format (HH:MM)
 * @returns Time string in AM/PM format (H:MM AM/PM)
 */
export function formatTimeToAmPmLong(time: string): string {
  if (!time) return '12:00 AM';
  
  // Parse 24-hour format
  const match = time.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = hours < 12 ? 'AM' : 'PM';
    
    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }
    
    return `${hours}:${minutes} ${period}`;
  }
  
  // If already in AM/PM format, return as is
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(time)) {
    return time;
  }
  
  return '12:00 AM';
}

