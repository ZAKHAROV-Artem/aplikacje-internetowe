import { Clock } from 'lucide-react';
import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatTimeTo24h, formatTimeToAmPmLong } from '@/lib/time-utils';
import { cn } from '@/lib/utils';

import { TimeCommandInput } from './components/time-command-input';
import { TimeSuggestions } from './components/time-suggestions';
import { useKeyboardNavigation } from './hooks/use-keyboard-navigation';
import { useTimeOptions } from './hooks/use-time-options';
import { useTimePickerState } from './hooks/use-time-picker-state';
import { useTimeSuggestions } from './hooks/use-time-suggestions';
import { DEFAULT_TIME } from './utils/time-picker-utils';

export interface TimePickerHandle {
  close: () => void;
  open: () => void;
}

interface TimePickerProps {
  'aria-label'?: string;
  className?: string;
  date: string;
  disableFutureTimes?: boolean;
  id?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  interval?: number;
  onChange: (date: string) => void;
  onClose?: () => void;
  timePickerRef?: React.RefObject<TimePickerHandle | null>;
  validTimes?: string[];
}

const DEFAULT_INTERVAL = 30;

function TimePicker({
  'aria-label': ariaLabel,
  className,
  date,
  disableFutureTimes = false,
  id,
  inputRef,
  interval = DEFAULT_INTERVAL,
  onChange,
  onClose,
  timePickerRef,
  validTimes,
}: TimePickerProps) {
  const { actions, state } = useTimePickerState(date);

  // Reference to the command input for focusing
  const internalInputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = inputRef || internalInputRef;

  // Time options hook
  const { filteredTimes } = useTimeOptions({
    disableFutureTimes,
    inputValue: state.inputValue,
    interval,
    validTimes,
  });

  // Suggestions hook
  const { applySuggestion, handleInputConfirm, isSuggestionFuture, isSuggestionValid } =
    useTimeSuggestions({
      disableFutureTimes,
      inputValue: state.inputValue,
      onChange: (newDate) => {
        actions.setSelectedTime(newDate);
        onChange(newDate);
      },
      onClose: () => {
        if (onClose) onClose();
      },
      setFocusedSuggestion: actions.setFocusedSuggestion,
      setInputValue: actions.setInputValue,
      setOpen: actions.setOpen,
      setSuggestions: actions.setSuggestions,
      validTimes,
    });

  // Keyboard navigation hook
  const { handleKeyDown } = useKeyboardNavigation({
    applySuggestion,
    focusedSuggestion: state.focusedSuggestion,
    handleInputConfirm,
    isSuggestionFuture,
    isSuggestionValid,
    setFocusedSuggestion: actions.setFocusedSuggestion,
    suggestions: state.suggestions,
  });

  // Expose methods to open/close the time picker through the ref
  useImperativeHandle(timePickerRef, () => ({
    close: () => actions.setOpen(false),
    open: () => actions.setOpen(true),
  }));

  // Call onClose when popover is closed
  useEffect(() => {
    if (!state.open && onClose) {
      onClose();
    }
  }, [state.open, onClose]);

  const handleSelect = useCallback(
    (value: string) => {
      actions.setSelectedTime(value);
      const [hour, minute] = value.split(':');
      const newDate = new Date();
      newDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

      // Use the standard format without seconds as the date-time-picker will handle seconds
      onChange(formatTimeTo24h(`${hour}:${minute}`));
      actions.setInputValue(''); // Reset input value when time is selected
      actions.setOpen(false);

      // Call onClose after selection is complete
      if (onClose) {
        onClose();
      }
    },
    [onChange, onClose, actions],
  );

  return (
    <Popover modal onOpenChange={actions.setOpen} open={state.open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          id={id}
          variant="outline"
        >
          <Clock className="mr-2 h-4 w-4" />
          {state.selectedTime !== DEFAULT_TIME
            ? formatTimeToAmPmLong(state.selectedTime)
            : 'Select time'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0">
        <Command>
          <TimeCommandInput
            inputRef={commandInputRef}
            onKeyDown={handleKeyDown}
            onValueChange={actions.setInputValue}
            value={state.inputValue}
          />

          {/* Show autocomplete suggestions */}
          <TimeSuggestions
            focusedSuggestion={state.focusedSuggestion}
            isSuggestionFuture={isSuggestionFuture}
            isSuggestionValid={isSuggestionValid}
            onSuggestionClick={applySuggestion}
            suggestions={state.suggestions}
          />

          <CommandEmpty>No time found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {filteredTimes.map((time) => (
              <CommandItem
                className="cursor-pointer"
                key={time.value}
                onSelect={() => handleSelect(time.value)}
              >
                {time.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default TimePicker;
