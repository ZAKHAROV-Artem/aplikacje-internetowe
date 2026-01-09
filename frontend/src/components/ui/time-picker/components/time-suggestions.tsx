import { cn } from '@/lib/utils';

interface TimeSuggestionsProps {
  focusedSuggestion: 'am' | 'pm' | null;
  isSuggestionFuture: (suggestion: string) => boolean;
  isSuggestionValid: (suggestion: string) => boolean;
  onSuggestionClick: (suggestion: string) => void;
  suggestions: {
    am: null | string;
    pm: null | string;
  };
}

export function TimeSuggestions({
  focusedSuggestion,
  isSuggestionFuture,
  isSuggestionValid,
  onSuggestionClick,
  suggestions,
}: TimeSuggestionsProps) {
  if (!suggestions.am && !suggestions.pm) {
    return null;
  }

  const canSelectSuggestion = (suggestion: null | string) => {
    if (!suggestion) return false;
    return !isSuggestionFuture(suggestion) && isSuggestionValid(suggestion);
  };

  return (
    <div className="border-t border-border px-2 py-2 text-sm">
      <p className="mb-1 text-xs text-muted-foreground">Press Tab to autocomplete:</p>
      <div className="flex flex-col gap-1">
        {suggestions.am && (
          <div
            className={cn(
              'cursor-pointer rounded px-2 py-1 hover:bg-accent',
              focusedSuggestion === 'am' ? 'bg-accent text-accent-foreground' : '',
              !canSelectSuggestion(suggestions.am)
                ? 'pointer-events-none cursor-not-allowed opacity-50'
                : '',
            )}
            onClick={() => {
              if (canSelectSuggestion(suggestions.am)) {
                onSuggestionClick(suggestions.am!);
              }
            }}
          >
            {suggestions.am}
          </div>
        )}
        {suggestions.pm && (
          <div
            className={cn(
              'rounded px-2 py-1',
              focusedSuggestion === 'pm' ? 'bg-accent text-accent-foreground' : '',
              !canSelectSuggestion(suggestions.pm)
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:bg-accent',
              !canSelectSuggestion(suggestions.pm)
                ? 'pointer-events-none cursor-not-allowed opacity-50'
                : '',
            )}
            onClick={() => {
              if (canSelectSuggestion(suggestions.pm)) {
                onSuggestionClick(suggestions.pm!);
              }
            }}
          >
            {suggestions.pm}
          </div>
        )}
      </div>
    </div>
  );
}
