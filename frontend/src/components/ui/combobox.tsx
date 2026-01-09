import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Input } from "./input";

type ComboboxItem = {
  disabled?: boolean;
  id: string;
  title: string;
  tooltip?: string;
};

type ComboboxProps = {
  "aria-labelledby"?: string;
  className?: string;
  id?: string;
  items: ComboboxItem[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  value: string;
};

export function Combobox({
  "aria-labelledby": ariaLabelledby,
  className,
  id,
  items,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  value,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const searchInputId = React.useId();

  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const selectedItem = React.useMemo(
    () => items.find((item) => item.id === value),
    [items, value]
  );

  return (
    <PopoverPrimitive.Root onOpenChange={setOpen} open={open}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          aria-expanded={open}
          aria-labelledby={ariaLabelledby}
          className={cn(
            "flex w-[180px] justify-between overflow-hidden font-normal",
            !value && "text-muted-foreground",
            className
          )}
          id={id}
          role="combobox"
          variant="outline"
        >
          <div className="overflow-hidden text-ellipsis">
            {selectedItem?.title || placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          avoidCollisions
          className="pointer-events-auto z-[1000] max-h-[50vh] overflow-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          collisionPadding={8}
          side="bottom"
          sideOffset={4}
        >
          <div className="flex h-full flex-col">
            <Input
              aria-label={searchPlaceholder}
              className="m-1 w-[calc(100%-0.5rem)]"
              id={searchInputId}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              role="searchbox"
              value={search}
            />
            <div
              className="overflow-y-auto"
              onWheel={(e) => {
                const element = e.currentTarget;
                const isAtTop = element.scrollTop === 0;
                const isAtBottom =
                  element.scrollTop + element.clientHeight ===
                  element.scrollHeight;

                // Allow scrolling within the dropdown
                if (
                  (isAtTop && e.deltaY < 0) || // At top and scrolling up
                  (isAtBottom && e.deltaY > 0) // At bottom and scrolling down
                ) {
                  e.stopPropagation(); // Prevent body scroll only at boundaries
                }
              }}
              role="listbox"
            >
              {filteredItems.length === 0 && (
                <div
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground"
                  role="alert"
                >
                  No results found
                </div>
              )}
              {filteredItems.map((item) => {
                return (
                  <div
                    aria-disabled={item.disabled ? true : undefined}
                    aria-selected={item.id === value}
                    className={cn(
                      "relative select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                      item.disabled
                        ? "pointer-events-none cursor-not-allowed opacity-50"
                        : "cursor-default hover:bg-accent hover:text-accent-foreground",
                      item.id === value &&
                        !item.disabled &&
                        "bg-accent text-accent-foreground"
                    )}
                    key={item.id}
                    onClick={() => {
                      if (item.disabled) return;
                      onValueChange(item.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    onKeyDown={(e) => {
                      if (item.disabled) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onValueChange(item.id);
                        setOpen(false);
                        setSearch("");
                      }
                    }}
                    role="option"
                    tabIndex={item.disabled ? -1 : 0}
                  >
                    <div className="flex items-center">
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {item.id === value && !item.disabled && (
                          <Check className="h-4 w-4" />
                        )}
                      </span>
                      <div>{item.title}</div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {item.tooltip}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
