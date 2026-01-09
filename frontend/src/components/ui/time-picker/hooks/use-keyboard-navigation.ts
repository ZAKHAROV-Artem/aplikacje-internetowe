interface KeyboardNavigationOptions {
  applySuggestion: (suggestion: string) => void;
  focusedSuggestion: 'am' | 'pm' | null;
  handleInputConfirm: () => void;
  isSuggestionFuture: (suggestion: string) => boolean;
  isSuggestionValid: (suggestion: string) => boolean;
  setFocusedSuggestion: (suggestion: 'am' | 'pm' | null) => void;
  suggestions: {
    am: null | string;
    pm: null | string;
  };
}

export function useKeyboardNavigation({
  applySuggestion,
  focusedSuggestion,
  handleInputConfirm,
  isSuggestionFuture,
  isSuggestionValid,
  setFocusedSuggestion,
  suggestions,
}: KeyboardNavigationOptions) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to confirm input and close popover
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputConfirm();
      return;
    }

    // Handle Tab key for autocompletion
    if (e.key === 'Tab') {
      e.preventDefault();

      // If a suggestion is already focused, select it
      if (focusedSuggestion && suggestions[focusedSuggestion]) {
        const selectedSuggestion = suggestions[focusedSuggestion];
        if (
          selectedSuggestion &&
          !isSuggestionFuture(selectedSuggestion) &&
          isSuggestionValid(selectedSuggestion)
        ) {
          applySuggestion(selectedSuggestion);
          return;
        }
      }

      // If no suggestion is focused, but suggestions exist, focus the first valid one
      if (
        suggestions.am &&
        !isSuggestionFuture(suggestions.am) &&
        isSuggestionValid(suggestions.am)
      ) {
        setFocusedSuggestion('am');
        return;
      } else if (
        suggestions.pm &&
        !isSuggestionFuture(suggestions.pm) &&
        isSuggestionValid(suggestions.pm)
      ) {
        setFocusedSuggestion('pm');
        return;
      }
    }

    // Arrow key navigation between AM/PM suggestions
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();

      const validSuggestions = {
        am:
          suggestions.am &&
          !isSuggestionFuture(suggestions.am) &&
          isSuggestionValid(suggestions.am),
        pm:
          suggestions.pm &&
          !isSuggestionFuture(suggestions.pm) &&
          isSuggestionValid(suggestions.pm),
      };

      // Toggle between AM and PM suggestions if both are valid
      if (validSuggestions.am && validSuggestions.pm) {
        setFocusedSuggestion(focusedSuggestion === 'am' ? 'pm' : 'am');
      }
      // Select AM if only AM is valid
      else if (validSuggestions.am) {
        setFocusedSuggestion('am');
      }
      // Select PM if only PM is valid
      else if (validSuggestions.pm) {
        setFocusedSuggestion('pm');
      }
    }
  };

  return {
    handleKeyDown,
  };
}
