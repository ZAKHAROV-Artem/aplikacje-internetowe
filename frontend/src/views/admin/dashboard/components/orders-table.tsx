import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { pickupRequestId } from "@/lib/id-utils";
import type { Order } from "../types";

interface OrdersTableProps {
  paginatedGroups: [string, Order[]][];
  expandedGroups: Set<string>;
  selectedOrders: Set<string>;
  onToggleGroup: (date: string) => void;
  onToggleOrderSelection: (orderId: string) => void;
  onToggleAllVisible: () => void;
  isAllVisibleSelected: boolean;
  getStatusBadgeVariant: (status: string) => string;
}

export function OrdersTable({
  paginatedGroups,
  expandedGroups,
  selectedOrders,
  onToggleGroup,
  onToggleOrderSelection,
  onToggleAllVisible,
  isAllVisibleSelected,
  getStatusBadgeVariant,
}: OrdersTableProps) {
  if (paginatedGroups.length === 0) {
    return (
      <p className="text-muted-foreground">
        No pickup requests found matching your filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/70">
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide w-12">
              <Checkbox
                checked={isAllVisibleSelected}
                onCheckedChange={onToggleAllVisible}
              />
            </th>
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
              Request ID
            </th>
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
              User
            </th>
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
              Status
            </th>
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
              Route
            </th>
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
              Pickup Date
            </th>
            <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
              Dropoff Date
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedGroups.map(([date, orders]) => (
            <>
              {/* Group Header Row */}
              <tr
                key={`group-${date}`}
                className="bg-primary/10 border-y-2 border-primary/20 hover:bg-primary/15 cursor-pointer transition-colors"
                onClick={() => onToggleGroup(date)}
              >
                <td colSpan={7} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedGroups.has(date) ? (
                        <ChevronDown className="h-5 w-5 text-primary" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-semibold text-base">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <Badge variant="default" className="text-xs font-medium">
                        {orders.length}{" "}
                        {orders.length === 1 ? "request" : "requests"}
                      </Badge>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Order Rows */}
              {expandedGroups.has(date) &&
                orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`${
                      index < orders.length - 1 ? "border-b" : ""
                    } hover:bg-accent/50 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <td className="p-4 pl-8 w-12">
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={() => onToggleOrderSelection(order.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-4 pl-6 text-sm font-mono text-foreground/90">
                      {pickupRequestId(order.id)}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          getStatusBadgeVariant(order.status) as
                            | "default"
                            | "secondary"
                            | "destructive"
                            | "outline"
                        }
                        className="text-xs font-medium"
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {order.route?.name || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {order.pickupDate
                        ? new Date(order.pickupDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {order.dropoffDate
                        ? new Date(order.dropoffDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                    </td>
                  </tr>
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
