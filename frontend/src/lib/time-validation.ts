import dayjs from './dayjs';

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

