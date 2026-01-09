import { useEffect, useState } from 'react';

import { DEFAULT_TIME, VALID_TIME_REGEX } from '../utils/time-picker-utils';

interface TimePickerState {
  focusedSuggestion: 'am' | 'pm' | null;
  inputValue: string;
  open: boolean;
  selectedTime: string;
  suggestions: {
    am: null | string;
    pm: null | string;
  };
}

interface TimePickerStateActions {
  resetState: () => void;
  setFocusedSuggestion: (suggestion: 'am' | 'pm' | null) => void;
  setInputValue: (value: string) => void;
  setOpen: (open: boolean) => void;
  setSelectedTime: (time: string) => void;
  setSuggestions: (suggestions: { am: null | string; pm: null | string }) => void;
}

export function useTimePickerState(initialDate: string) {
  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    try {
      if (initialDate && VALID_TIME_REGEX.test(initialDate)) {
        return initialDate;
      }
      return DEFAULT_TIME;
    } catch {
      return DEFAULT_TIME;
    }
  });

  // Store the current suggestions
  const [suggestions, setSuggestions] = useState<{
    am: null | string;
    pm: null | string;
  }>({
    am: null,
    pm: null,
  });

  // Track which suggestion is currently selected (for tab completion)
  const [focusedSuggestion, setFocusedSuggestion] = useState<'am' | 'pm' | null>(null);

  // Update selectedTime when initialDate changes
  useEffect(() => {
    setSelectedTime(initialDate);
  }, [initialDate]);

  // Reset input value when popup closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
      setSuggestions({ am: null, pm: null });
      setFocusedSuggestion(null);
    }
  }, [open]);

  const resetState = () => {
    setInputValue('');
    setSuggestions({ am: null, pm: null });
    setFocusedSuggestion(null);
  };

  const state: TimePickerState = {
    focusedSuggestion,
    inputValue,
    open,
    selectedTime,
    suggestions,
  };

  const actions: TimePickerStateActions = {
    resetState,
    setFocusedSuggestion,
    setInputValue,
    setOpen,
    setSelectedTime,
    setSuggestions,
  };

  return { actions, state };
}
