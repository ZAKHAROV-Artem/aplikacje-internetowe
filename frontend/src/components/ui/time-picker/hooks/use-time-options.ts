import { useMemo } from 'react';

import dayjs from '@/lib/dayjs';
import { formatTimeTo24h, formatTimeToAmPmLong } from '@/lib/time-utils';
import { isToday } from '@/lib/time-validation';

interface TimeOptionsParams {
  disableFutureTimes?: boolean;
  inputValue: string;
  interval?: number;
  validTimes?: string[];
}

const DEFAULT_INTERVAL = 30;

export function useTimeOptions({
  disableFutureTimes = false,
  inputValue,
  interval = DEFAULT_INTERVAL,
  validTimes,
}: TimeOptionsParams) {
  const times = useMemo(() => {
    const baseDate = dayjs().startOf('day');
    const options = [];
    const intervalsPerDay = Math.floor((24 * 60) / interval);
    const now = dayjs();

    for (let i = 0; i < intervalsPerDay; i++) {
      const time = baseDate.add(i * interval, 'minute');
      // If disabling future times and today, filter out times after now
      if (disableFutureTimes && isToday(time.toDate()) && time.isAfter(now)) {
        continue;
      }
      options.push({
        label: formatTimeToAmPmLong(time.format('HH:mm')),
        value: formatTimeTo24h(time.format('HH:mm')),
      });
    }

    // Filter by validTimes if provided
    if (validTimes) {
      return options.filter((t) => validTimes.includes(t.value));
    }
    return options;
  }, [interval, disableFutureTimes, validTimes]);

  const filteredTimes = useMemo(() => {
    if (!inputValue) return times;

    // Normalize input for comparison
    const searchNumbers = inputValue.replace(/[^0-9]/gi, '');
    const hasColon = inputValue.includes(':');

    return times.filter((time) => {
      const [hours, minutes] = time.value.split(':');
      const hoursNum = parseInt(hours, 10);
      const hours12 = (hoursNum > 12 ? hoursNum - 12 : hoursNum).toString().padStart(2, '0');

      // Case 1: Input with colon (e.g. "05:" or "05:00")
      if (hasColon) {
        const searchPart = inputValue.split(':')[0].padStart(2, '0');
        return hours === searchPart || hours12 === searchPart;
      }

      // Case 2: 3 or 4 digits (e.g. "500" -> "5:00" or "1300" -> "1:00 PM")
      if (searchNumbers.length >= 3) {
        let inputHours;
        let inputMinutes;

        // Handle military time format (e.g. "1300")
        if (parseInt(searchNumbers.slice(0, 2), 10) <= 23) {
          inputHours = searchNumbers.slice(0, 2);
          inputMinutes = searchNumbers.slice(2);

          // Convert input hours to both 24h and 12h format for comparison
          const inputHours24 = inputHours;
          const inputHours12 = (
            parseInt(inputHours, 10) > 12 ? parseInt(inputHours, 10) - 12 : parseInt(inputHours, 10)
          )
            .toString()
            .padStart(2, '0');

          return (hours === inputHours24 || hours === inputHours12) && minutes === inputMinutes;
        } else {
          inputHours = searchNumbers.slice(0, 1).padStart(2, '0');
          inputMinutes = searchNumbers.slice(1, 3);
          return (hours === inputHours || hours12 === inputHours) && minutes === inputMinutes;
        }
      }

      // Case 3: 1-2 digits (e.g. "5" or "05")
      const normalizedSearch = searchNumbers.padStart(2, '0');
      return (
        hours === normalizedSearch ||
        hours12 === normalizedSearch ||
        hours === searchNumbers ||
        hours12 === searchNumbers
      );
    });
  }, [times, inputValue]);

  return {
    filteredTimes,
    times,
  };
}
