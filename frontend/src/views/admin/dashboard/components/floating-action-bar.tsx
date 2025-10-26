import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface StatusOption {
  value: string;
  label: string;
}

interface FloatingActionBarProps {
  selectedCount: number;
  statusOptions: StatusOption[];
  onStatusUpdate: (status: string) => void;
  onClear: () => void;
  isUpdating: boolean;
}

export function FloatingActionBar({
  selectedCount,
  statusOptions,
  onStatusUpdate,
  onClear,
  isUpdating,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-medium whitespace-nowrap">
                {selectedCount} {selectedCount === 1 ? "item" : "items"}{" "}
                selected
              </span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex gap-2">
              {statusOptions
                .filter((status) => status.value !== "all")
                .map((status) => (
                  <Button
                    key={status.value}
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(status.value)}
                    className="font-medium"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : status.label}
                  </Button>
                ))}
            </div>
            <div className="h-6 w-px bg-border" />
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
