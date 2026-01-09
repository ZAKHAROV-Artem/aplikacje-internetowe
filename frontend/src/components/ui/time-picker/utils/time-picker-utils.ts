type Meridiem = 'am' | 'pm' | undefined;

// Constants
export const DEFAULT_TIME = 'HH:mm';
export const VALID_TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
export const DIRECT_TIME_REGEX = /^([0-9]{1,4})(am|pm)?$/i;
export const TIME_FORMAT_REGEX = /^([0-9]{1,2})(:)?([0-9]{0,2})\s*(am|pm)?$/i;
export const MAX_TIME_DIGITS = 4;

export const convertHoursWithMeridiem = (hours: number, meridiem: Meridiem): number => {
  if (meridiem) {
    if (meridiem === 'pm' && hours < 12) {
      return hours + 12;
    }
    if (meridiem === 'am' && hours === 12) {
      return 0;
    }
  }
  return hours;
};

export const isValidTime = (hours: number, minutes: number): boolean => {
  return hours < 24 && minutes < 60;
};

export const formatTimeValue = (hours: number, minutes: number): string => {
  // Return format as HH:MM without seconds as the date-time-picker component handles seconds separately
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const parseDirectTimeInput = (
  value: string,
): null | { hours: number; meridiem: Meridiem; minutes: number } => {
  const match = value.match(DIRECT_TIME_REGEX);
  if (!match) return null;

  const timeStr = match[1];
  const meridiem = match[2]?.toLowerCase() as Meridiem;

  if (timeStr.length >= 3) {
    const hours = parseInt(timeStr.slice(0, -2), 10);
    const minutes = parseInt(timeStr.slice(-2), 10);

    const adjustedHours = convertHoursWithMeridiem(hours, meridiem);

    if (!isValidTime(adjustedHours, 0)) {
      const firstSignificantDigit = parseInt(adjustedHours.toString()[0], 10);
      return { hours: firstSignificantDigit, meridiem, minutes: 0 };
    }

    return { hours, meridiem, minutes };
  }

  const hours = parseInt(timeStr, 10);
  const adjustedHours = convertHoursWithMeridiem(hours, meridiem);

  if (!isValidTime(adjustedHours, 0)) {
    const firstSignificantDigit = parseInt(adjustedHours.toString()[0], 10);
    return { hours: firstSignificantDigit, meridiem, minutes: 0 };
  }

  return { hours, meridiem, minutes: 0 };
};

export const parseFormattedTimeInput = (
  value: string,
): null | { hours: number; meridiem: Meridiem; minutes: number } => {
  const match = value.match(TIME_FORMAT_REGEX);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[3] || '00', 10);
  const meridiem = match[4]?.toLowerCase() as Meridiem;

  const adjustedHours = convertHoursWithMeridiem(hours, meridiem);
  if (!isValidTime(adjustedHours, minutes)) return null;

  return { hours, meridiem, minutes };
};

// Format a suggestion with consistent formatting
export const formatSuggestion = (timeValue: string, meridiem: 'am' | 'pm'): null | string => {
  const [hours, minutes] = timeValue.split(':');
  const hoursNum = parseInt(hours, 10);

  if (isNaN(hoursNum) || hoursNum > 12) return null;

  const formattedMinutes = minutes ? minutes : '00';
  // Use padStart to ensure hours always have 2 digits (with leading zero if needed)
  return `${hoursNum.toString().padStart(2, '0')}:${formattedMinutes} ${meridiem.toUpperCase()}`;
};

// Get suggested completions for the current input
export const getSuggestions = (value: string): { am: null | string; pm: null | string } => {
  if (!value) return { am: null, pm: null };

  // If input already has AM/PM, return appropriate suggestion
  if (/am$/i.test(value)) {
    const baseValue = value.replace(/am$/i, '').trim();
    return { am: formatSuggestion(baseValue, 'am'), pm: null };
  }
  if (/pm$/i.test(value)) {
    const baseValue = value.replace(/pm$/i, '').trim();
    return { am: null, pm: formatSuggestion(baseValue, 'pm') };
  }

  // Handle common inputs like "3:", "11", etc.
  const match = value.match(/^(\d{1,2})(:)?(\d{0,2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    let minutes = match[3] ? parseInt(match[3], 10) : 0;

    // If only a colon was entered with no minutes, suggest both AM/PM
    if (match[2] === ':' && !match[3]) {
      return {
        am: formatSuggestion(`${hours}:00`, 'am'),
        pm: formatSuggestion(`${hours}:00`, 'pm'),
      };
    }

    // Format minutes properly if they were entered
    if (match[3]) {
      // Handle single digit minute entries like "5:3" → "5:30"
      if (match[3].length === 1) {
        minutes = parseInt(match[3] + '0', 10);
      }
    }

    return {
      am: formatSuggestion(`${hours}:${minutes.toString().padStart(2, '0')}`, 'am'),
      pm: formatSuggestion(`${hours}:${minutes.toString().padStart(2, '0')}`, 'pm'),
    };
  }

  return { am: null, pm: null };
};

export { type Meridiem };
