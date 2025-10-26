import { useState, useCallback } from "react";
import type { Order } from "../types";

export function useOrderSelection(orders: Order[]) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

  const toggleAllVisible = useCallback(
    (visibleOrderIds: string[]) => {
      const allSelected = visibleOrderIds.every((id) => selectedOrders.has(id));

      if (allSelected) {
        setSelectedOrders((prev) => {
          const newSet = new Set(prev);
          visibleOrderIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      } else {
        setSelectedOrders((prev) => {
          const newSet = new Set(prev);
          visibleOrderIds.forEach((id) => newSet.add(id));
          return newSet;
        });
      }
    },
    [selectedOrders]
  );

  const clearSelection = useCallback(() => {
    setSelectedOrders(new Set());
  }, []);

  return {
    selectedOrders,
    toggleOrderSelection,
    toggleAllVisible,
    clearSelection,
  };
}
