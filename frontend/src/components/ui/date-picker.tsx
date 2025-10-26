import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import dayjs from "dayjs";
import type { Matcher } from "react-day-picker";
import { useState } from "react";

interface DatePickerProps {
  align?: "center" | "end" | "start";
  className?: string;
  disableDate?: boolean;
  disabledDays?: Matcher | Matcher[];
  onChange: (date: Date | undefined) => void;
  value?: dayjs.ConfigType;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "text";
  // Optional: allow selecting part of day (AM/PM) alongside the date
  withPartOfDay?: boolean;
  partOfDay?: "AM" | "PM";
  defaultPartOfDay?: "AM" | "PM";
  onPartOfDayChange?: (val: "AM" | "PM") => void;
}

export function DatePicker({
  align = "start",
  className,
  disableDate = false,
  disabledDays,
  onChange,
  value,
  size = "default",
  variant = "default",
  withPartOfDay = false,
  partOfDay,
  defaultPartOfDay = "AM",
  onPartOfDayChange,
}: DatePickerProps) {
  const [innerPartOfDay, setInnerPartOfDay] = useState<"AM" | "PM">(
    defaultPartOfDay
  );
  const effectivePartOfDay = partOfDay ?? innerPartOfDay;
  const date = value ? dayjs(value).toDate() : undefined;
  // Size-based styling
  const sizeClasses = {
    sm: "h-8 max-w-[200px] text-xs md:text-xs",
    default: "h-9 max-w-[240px] text-base md:text-sm",
    lg: "h-10 max-w-[280px] text-base md:text-sm",
  };

  const iconSizeClasses = {
    sm: "mr-1.5 h-3 w-3",
    default: "mr-2 h-4 w-4",
    lg: "mr-2 h-5 w-5",
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    // Use dayjs to create a date at noon to avoid timezone issues
    const localDate = dayjs(selectedDate)
      .hour(12)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
    onChange(localDate);
  };

  const handlePartChange = (next: "AM" | "PM") => {
    if (partOfDay === undefined) {
      setInnerPartOfDay(next);
    }
    onPartOfDayChange?.(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {variant === "text" ? (
          <button
            type="button"
            className={cn(
              "inline-flex items-center font-semibold text-foreground underline decoration-2 underline-offset-4 hover:text-primary transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disableDate}
          >
            {value ? (
              dayjs(value).isValid() ? (
                <span>
                  {dayjs(value).format("MMM D, YYYY")}
                  {withPartOfDay ? (
                    <span className="ml-1">· {effectivePartOfDay}</span>
                  ) : null}
                </span>
              ) : (
                <span>Invalid Date</span>
              )
            ) : (
              <span className="italic font-normal">select date</span>
            )}
          </button>
        ) : (
          <Button
            className={cn(
              sizeClasses[size],
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disableDate}
            variant={"outline"}
          >
            <CalendarIcon className={iconSizeClasses[size]} />
            {value ? (
              dayjs(value).isValid() ? (
                <span>
                  {dayjs(value).format("MMMM D, YYYY")}
                  {withPartOfDay ? (
                    <span className="ml-2 text-muted-foreground">
                      · {effectivePartOfDay}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span>Invalid Date</span>
              )
            ) : (
              <span>Pick a date{withPartOfDay ? " · AM/PM" : ""}</span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <Calendar
          defaultMonth={date}
          disabled={disabledDays}
          initialFocus
          mode="single"
          onSelect={handleDateSelect}
          selected={date}
        />
        {withPartOfDay ? (
          <div
            className={cn(
              "border-t flex items-center gap-3",
              size === "sm" ? "p-2" : "p-3"
            )}
          >
            <span
              className={cn(
                "text-muted-foreground",
                size === "sm" ? "text-xs" : "text-sm"
              )}
            >
              Pickup time
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size={size === "lg" ? "sm" : "sm"}
                variant={effectivePartOfDay === "AM" ? "default" : "outline"}
                onClick={() => handlePartChange("AM")}
              >
                AM
              </Button>
              <Button
                type="button"
                size={size === "lg" ? "sm" : "sm"}
                variant={effectivePartOfDay === "PM" ? "default" : "outline"}
                onClick={() => handlePartChange("PM")}
              >
                PM
              </Button>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
