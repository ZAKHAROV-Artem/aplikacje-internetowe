import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, X } from "lucide-react";
import type { DisplayRule } from "./types";
import { formatDate, getNextPickupDate } from "./utils";

interface SubscriptionCardProps {
  rule: DisplayRule;
  onCancel: (id: string, name: string) => void;
  onActivate: (id: string) => void;
}

export const SubscriptionCard = ({
  rule,
  onCancel,
  onActivate,
}: SubscriptionCardProps) => {
  const customerName =
    `${rule.payload.customer.firstName} ${rule.payload.customer.lastName}`.trim();
  const ruleName = `${customerName} - ${rule.payload.dayOfTheWeek}`;

  const nextPickup = getNextPickupDate(rule.payload.dayOfTheWeek);
  const nextPickupRelative = nextPickup ? nextPickup.fromNow() : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 active:scale-[0.98] border-0 shadow-sm bg-card">
      <CardContent className="p-3 sm:p-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Main content */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">
                Creating pickup requests every{" "}
                <span className="font-semibold text-primary">
                  {rule.payload.dayOfTheWeek}
                </span>{" "}
                from{" "}
                <span className="font-medium">
                  {formatDate(rule.createdAt)}
                </span>
                {rule.payload.stopDate ? (
                  <>
                    {" "}
                    to{" "}
                    <span className="font-medium">
                      {formatDate(rule.payload.stopDate)}
                    </span>
                  </>
                ) : (
                  ""
                )}
                {rule.isActive && nextPickupRelative && (
                  <>
                    {" "}
                    • Next{" "}
                    <span className="font-medium text-primary">
                      {nextPickupRelative}
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {customerName}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={rule.isActive ? "default" : "secondary"}>
              {rule.isActive ? "Active" : "Cancelled"}
            </Badge>
            {rule.isActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(rule.id, ruleName)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onActivate(rule.id)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
