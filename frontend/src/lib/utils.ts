// Key functionality: Utility to merge Tailwind classes with conditional classnames.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { PickupRequest } from "@/lib/schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines if an order is considered "active" or "current"
 */
export function isActiveOrder(order: PickupRequest): boolean {
  const activeStatuses = ["new", "scheduled", "in_progress", "picked_up"];
  return activeStatuses.includes(order.status?.toLowerCase() || "");
}

/**
 * Gets the next upcoming order from a list of orders
 */
export function getNextOrder(orders: PickupRequest[]): PickupRequest | null {
  const now = new Date();

  const activeOrders = orders
    .filter(isActiveOrder)
    .filter((order) => {
      const pickupDate = new Date(order.orderDate);
      return pickupDate >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
    );

  return activeOrders[0] || null;
}

/**
 * Formats a date for display in the current order card
 */
export function formatOrderDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const orderDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = orderDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7)
    return date.toLocaleDateString("en-US", { weekday: "long" });

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
