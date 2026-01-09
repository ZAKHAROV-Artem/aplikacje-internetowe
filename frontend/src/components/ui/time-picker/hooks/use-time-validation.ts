import dayjs from '@/lib/dayjs';
import { isToday } from '@/lib/time-validation';

import {
  convertHoursWithMeridiem,
  formatTimeValue,
  isValidTime,
  type Meridiem,
} from '../utils/time-picker-utils';

interface TimeValidationOptions {
  disableFutureTimes?: boolean;
  validTimes?: string[];
}

export function useTimeValidation({
  disableFutureTimes = false,
  validTimes,
}: TimeValidationOptions) {
  const validateAndUpdateTime = (
    hours: number,
    minutes: number,
    meridiem: Meridiem,
    onChange: (date: string) => void,
  ): boolean => {
    const adjustedHours = convertHoursWithMeridiem(hours, meridiem);
    const newTime = dayjs().hour(adjustedHours).minute(minutes).second(0);
    const now = dayjs();

    // Check if time is in the future when disableFutureTimes is true
    if (disableFutureTimes && isToday(newTime.toDate()) && newTime.isAfter(now)) {
      return false;
    }

    // Check if time is valid (24h format)
    if (isValidTime(adjustedHours, minutes)) {
      const formatted = formatTimeValue(adjustedHours, minutes);

      // Check if time is in validTimes list (if provided)
      if (validTimes && !validTimes.includes(formatted)) {
        return false;
      }

      onChange(formatted);
      return true;
    }

    return false;
  };

  const isSuggestionFuture = (suggestion: string): boolean => {
    if (!disableFutureTimes) return false;
    if (!suggestion) return false;

    // Only check for today
    const now = dayjs();
    const [time, meridiem] = suggestion.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (meridiem?.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (meridiem?.toLowerCase() === 'am' && hours === 12) hours = 0;

    const suggestionTime = dayjs().hour(hours).minute(minutes).second(0);
    return isToday(suggestionTime.toDate()) && suggestionTime.isAfter(now);
  };

  const isSuggestionValid = (suggestion: string): boolean => {
    if (!suggestion) return false;
    if (!validTimes) return true;

    const [time, meridiem] = suggestion.split(' ');
    let hours = Number(time.split(':')[0]);
    const minutes = Number(time.split(':')[1]);

    if (meridiem?.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (meridiem?.toLowerCase() === 'am' && hours === 12) hours = 0;

    const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return validTimes.includes(value);
  };

  const isTimeValid = (formattedTime: string): boolean => {
    if (!validTimes) return true;
    return validTimes.includes(formattedTime);
  };

  return {
    isSuggestionFuture,
    isSuggestionValid,
    isTimeValid,
    validateAndUpdateTime,
  };
}
