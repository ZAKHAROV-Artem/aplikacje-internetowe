import { useState, useMemo } from "react";
import type { FilterState, Order } from "../types";

export function useDashboardFilters(orders: Order[]) {
  const [filters, setFilters] = useState<FilterState>({
    user: "all",
    status: "all",
    pickupDateRange: undefined,
    dropoffDateRange: undefined,
    search: "",
  });

  // Get unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    orders.forEach((order) => {
      if (order.user?.firstName && order.user?.lastName) {
        users.add(`${order.user.firstName} ${order.user.lastName}`);
      }
    });
    return Array.from(users).sort();
  }, [orders]);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // User filter
      if (filters.user && filters.user !== "all") {
        const fullName = `${order.user?.firstName || ""} ${
          order.user?.lastName || ""
        }`.trim();
        if (!fullName.toLowerCase().includes(filters.user.toLowerCase())) {
          return false;
        }
      }

      // Status filter
      if (
        filters.status &&
        filters.status !== "all" &&
        order.status !== filters.status
      ) {
        return false;
      }

      // Pickup date range filter
      if (filters.pickupDateRange?.from && order.pickupDate) {
        const pickupDate = new Date(order.pickupDate);
        if (pickupDate < filters.pickupDateRange.from) {
          return false;
        }
      }
      if (filters.pickupDateRange?.to && order.pickupDate) {
        const pickupDate = new Date(order.pickupDate);
        if (pickupDate > filters.pickupDateRange.to) {
          return false;
        }
      }

      // Dropoff date range filter
      if (filters.dropoffDateRange?.from && order.dropoffDate) {
        const dropoffDate = new Date(order.dropoffDate);
        if (dropoffDate < filters.dropoffDateRange.from) {
          return false;
        }
      }
      if (filters.dropoffDateRange?.to && order.dropoffDate) {
        const dropoffDate = new Date(order.dropoffDate);
        if (dropoffDate > filters.dropoffDateRange.to) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = [
          order.id,
          order.user?.firstName,
          order.user?.lastName,
          order.user?.email,
          order.route?.name,
          order.company?.name,
          order.status,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filters]);

  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      user: "all",
      status: "all",
      pickupDateRange: undefined,
      dropoffDateRange: undefined,
      search: "",
    });
  };

  return {
    filters,
    uniqueUsers,
    filteredOrders,
    handleFilterChange,
    clearFilters,
  };
}
