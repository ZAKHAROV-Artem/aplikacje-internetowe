import { useEffect } from 'react';

import {
  getSuggestions,
  type Meridiem,
  parseDirectTimeInput,
  parseFormattedTimeInput,
} from '../utils/time-picker-utils';
import { useTimeValidation } from './use-time-validation';

interface TimeSuggestionsOptions {
  disableFutureTimes?: boolean;
  inputValue: string;
  onChange: (date: string) => void;
  onClose: () => void;
  setFocusedSuggestion: (suggestion: 'am' | 'pm' | null) => void;
  setInputValue: (value: string) => void;
  setOpen: (open: boolean) => void;
  setSuggestions: (suggestions: { am: null | string; pm: null | string }) => void;
  validTimes?: string[];
}

export function useTimeSuggestions({
  disableFutureTimes = false,
  inputValue,
  onChange,
  onClose,
  setFocusedSuggestion,
  setInputValue,
  setOpen,
  setSuggestions,
  validTimes,
}: TimeSuggestionsOptions) {
  const { isSuggestionFuture, isSuggestionValid, isTimeValid, validateAndUpdateTime } =
    useTimeValidation({
      disableFutureTimes,
      validTimes,
    });

  // Update suggestions when input changes
  useEffect(() => {
    setSuggestions(getSuggestions(inputValue));
    setFocusedSuggestion(null);
  }, [inputValue, setSuggestions, setFocusedSuggestion]);

  const applySuggestion = (suggestion: string) => {
    // Parse the suggestion (e.g., "5:30 PM")
    const [time, meridiem] = suggestion.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (meridiem?.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (meridiem?.toLowerCase() === 'am' && hours === 12) hours = 0;

    // Update time with seconds set to 0
    if (validateAndUpdateTime(hours, minutes, meridiem.toLowerCase() as Meridiem, onChange)) {
      setInputValue(suggestion);
      setOpen(false);
      onClose();
    }
  };

  const handleInputConfirm = () => {
    if (!inputValue) return;

    // Try parsing direct number input first
    const directTimeResult = parseDirectTimeInput(inputValue);
    if (directTimeResult) {
      let { hours } = directTimeResult;
      const { meridiem, minutes } = directTimeResult;

      // Convert to 24h for validation
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;

      if (isTimeValid(formattedTime)) {
        if (validateAndUpdateTime(hours, minutes, meridiem, onChange)) {
          setOpen(false);
          onClose();
        }
      } else {
        setInputValue(''); // Clear invalid input
      }
      return;
    }

    // Try parsing formatted time input
    const formattedTimeResult = parseFormattedTimeInput(inputValue);
    if (formattedTimeResult) {
      let { hours } = formattedTimeResult;
      const { meridiem, minutes } = formattedTimeResult;

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;

      if (isTimeValid(formattedTime)) {
        if (validateAndUpdateTime(hours, minutes, meridiem, onChange)) {
          setOpen(false);
          onClose();
        }
      } else {
        setInputValue(''); // Clear invalid input
      }
      return;
    }

    // If input doesn't parse, clear it
    setInputValue('');
  };

  return {
    applySuggestion,
    handleInputConfirm,
    isSuggestionFuture,
    isSuggestionValid,
  };
}
