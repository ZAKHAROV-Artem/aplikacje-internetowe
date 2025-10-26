import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";

export interface QuickAction {
  /**
   * Whether the action is disabled. You can pass:
   *  • a boolean – for a static disabled/enabled state
   *  • a function – it will be invoked with the current range and the `maxDate`
   *    so you can decide dynamically.
   */
  disabled?: ((ctx: DisabledPredicateCtx) => boolean) | boolean;
  /** Button label */
  label: string;
  /**
   * Click handler receives current range and a helper setter. It can ignore the
   * context or use it to compute a new range. When it wants to update the
   * picker it should call `setRange`.
   */
  onClick: (ctx: {
    currentRange: DateRange | undefined;
    setRange: (range: DateRange | undefined) => void;
  }) => void;
}

interface DateRangePickerProps extends HTMLAttributes<HTMLDivElement> {
  canGoBack?: boolean;
  canGoForward?: boolean;
  customQuickActions?: QuickAction[];
  customTips?: ReactNode;
  dateRange: DateRange | undefined;
  disabled?: boolean;
  maxDate?: Date;
  /** Allows overriding the label for the automatically generated "next" period quick-action button. */
  nextLabel?: string;
  numberOfMonths?: number;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onNextPeriod?: () => void;
  // Period navigation props
  onPreviousPeriod?: () => void;
  /** Allows overriding the label for the automatically generated "previous" period quick-action button. */
  previousLabel?: string;
  /** Override the quick-select buttons. When omitted, the default set is used. */
  quickActionsOverride?: QuickAction[];
  /** When true, renders left/right arrow buttons that invoke period navigation callbacks. */
  showArrows?: boolean;
  showChevronNavigation?: boolean;
  /** When true, includes previous/next period buttons in quick actions. */
  showPeriodNavigation?: boolean;
  showQuickActions?: boolean;
  showTips?: boolean;
}

// Context passed when evaluating dynamic disabled state for a quick-action
type DisabledPredicateCtx = {
  currentRange: DateRange | undefined;
  /** The `maxDate` prop from the picker, if provided. */
  maxDate?: Date;
};

// Default quick actions ------------------------------------------------------
const defaultQuickActions: QuickAction[] = [
  {
    label: "Today",
    onClick: ({ setRange }) => {
      const today = new Date();
      setRange({
        from: today,
        to: today,
      });
    },
  },
  {
    label: "This Week",
    onClick: ({ setRange }) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      setRange({
        from: startOfWeek,
        to: endOfWeek,
      });
    },
  },
  {
    label: "This Month",
    onClick: ({ setRange }) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setRange({
        from: startOfMonth,
        to: endOfMonth,
      });
    },
  },
];

export function DateRangePicker({
  canGoBack,
  canGoForward,
  className,
  customQuickActions,
  customTips: CustomTips,
  dateRange,
  disabled,
  maxDate,
  nextLabel = "Next Period",
  numberOfMonths = 2,
  onDateRangeChange,
  onNextPeriod,
  onPreviousPeriod,
  previousLabel = "Previous Period",
  quickActionsOverride,
  showArrows = false,
  showChevronNavigation = false,
  showPeriodNavigation = true,
  showQuickActions = false,
  showTips = false,
}: DateRangePickerProps) {
  // Use custom quick actions if provided, otherwise use default ones
  const quickActions = customQuickActions || defaultQuickActions;

  // Create period navigation actions if handlers are provided and showPeriodNavigation is true
  const periodActions: QuickAction[] = [];
  if (onPreviousPeriod && onNextPeriod && showPeriodNavigation) {
    periodActions.push(
      {
        disabled: !canGoBack,
        label: previousLabel,
        onClick: () => {
          onPreviousPeriod();
        },
      },
      {
        disabled: !canGoForward,
        label: nextLabel,
        onClick: () => {
          onNextPeriod();
        },
      }
    );
  }

  const allActions: QuickAction[] = quickActionsOverride ?? [
    ...periodActions,
    ...quickActions,
  ];

  const handleDateRangeChange = (range: DateRange | undefined) => {
    // Prevent clearing the range when clicking on the start date of an existing range
    if (!range && dateRange?.from && dateRange?.to) {
      // If the new range is undefined but we had a valid range before,
      // it means the user clicked on the start date to "reset" the range.
      // In this case, we should maintain the existing range instead of clearing it.
      return;
    }

    onDateRangeChange(range);
  };

  const DatePickerContent = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
          disabled={disabled}
          id="date"
          variant={"outline"}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {dayjs(dateRange.from).format("MMM DD, YYYY")} -{" "}
                {dayjs(dateRange.to).format("MMM DD, YYYY")}
              </>
            ) : (
              dayjs(dateRange.from).format("MMM DD, YYYY")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col">
          <div className="flex justify-center sm:justify-start">
            <Calendar
              defaultMonth={
                dateRange?.from ? dayjs(dateRange.from).toDate() : undefined
              }
              initialFocus
              mode="range"
              numberOfMonths={numberOfMonths}
              onSelect={handleDateRangeChange}
              selected={dateRange}
              toDate={maxDate}
            />
          </div>
          {(showTips || CustomTips) && (
            <div className="border-t p-3 text-sm text-muted-foreground">
              {CustomTips ? (
                CustomTips
              ) : (
                <p>
                  💡 Tip: Click a date to start selection, click another to end.
                </p>
              )}
            </div>
          )}
          {showQuickActions && (
            <div className="border-t p-3">
              <div className="mb-2 text-sm font-medium">Quick Select</div>
              <div className="flex flex-wrap gap-2">
                {allActions.map((action) => {
                  const isDisabled =
                    typeof action.disabled === "function"
                      ? action.disabled({
                          currentRange: dateRange,
                          maxDate,
                        })
                      : action.disabled;

                  return (
                    <Button
                      disabled={isDisabled}
                      key={action.label}
                      onClick={() =>
                        action.onClick({
                          currentRange: dateRange,
                          setRange: onDateRangeChange,
                        })
                      }
                      size="sm"
                      variant="outline"
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  // If chevron navigation or arrows are enabled and handlers are provided, wrap with navigation buttons
  if (
    (showChevronNavigation || showArrows) &&
    onPreviousPeriod &&
    onNextPeriod
  ) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          disabled={!canGoBack || disabled}
          onClick={onPreviousPeriod}
          size="icon"
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {DatePickerContent}

        <Button
          disabled={!canGoForward || disabled}
          onClick={onNextPeriod}
          size="icon"
          variant="outline"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Default layout without chevron navigation
  return <div className={cn("grid gap-2", className)}>{DatePickerContent}</div>;
}
