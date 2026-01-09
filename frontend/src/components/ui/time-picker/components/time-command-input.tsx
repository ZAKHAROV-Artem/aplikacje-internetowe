import React from 'react';

import { CommandInput } from '@/components/ui/command';

import { MAX_TIME_DIGITS } from '../utils/time-picker-utils';

interface TimeCommandInputProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export function TimeCommandInput({
  inputRef,
  onKeyDown,
  onValueChange,
  placeholder = 'Type a time (e.g., 02:30, 14, 11:)',
  value,
}: TimeCommandInputProps) {
  const handleInputChange = (inputValue: string) => {
    // Prevent input of more than 4 digits
    const numericValue = inputValue.replace(/[^0-9]/gi, '');
    if (numericValue.length > MAX_TIME_DIGITS) {
      return;
    }

    onValueChange(inputValue);
  };

  return (
    <CommandInput
      onKeyDown={onKeyDown}
      onValueChange={handleInputChange}
      placeholder={placeholder}
      ref={inputRef}
      value={value}
    />
  );
}
