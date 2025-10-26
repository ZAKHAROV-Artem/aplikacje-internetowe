import { useMemo, useState } from "react";
import type { GroupedOrders, Order } from "../types";

export function useOrderGrouping(filteredOrders: Order[]) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const groupedOrders = useMemo(() => {
    const groups: GroupedOrders = {};

    filteredOrders.forEach((order) => {
      const date = new Date(order.pickupDate || order.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });

    // Sort dates in descending order
    const sortedGroups = Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((result, date) => {
        result[date] = groups[date];
        return result;
      }, {} as GroupedOrders);

    // Expand all groups by default
    setExpandedGroups(new Set(Object.keys(sortedGroups)));

    return sortedGroups;
  }, [filteredOrders]);

  const toggleGroup = (date: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  return { groupedOrders, expandedGroups, toggleGroup };
}
