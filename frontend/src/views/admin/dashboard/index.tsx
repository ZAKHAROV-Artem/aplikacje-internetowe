import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetOrdersQuery,
  useBulkUpdateOrderStatusMutation,
} from "@/modules/pickup-requests/pickup-requests.api";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import { useDashboardFilters } from "./hooks/use-dashboard-filters";
import { useOrderGrouping } from "./hooks/use-order-grouping";
import { useOrderPagination } from "./hooks/use-order-pagination";
import { useOrderSelection } from "./hooks/use-order-selection";
import { FloatingActionBar } from "./components/floating-action-bar";
import { DashboardFilters } from "./components/dashboard-filters";
import { OrdersTable } from "./components/orders-table";
import { DashboardPagination } from "./components/dashboard-pagination";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminDashboard() {
  const { data: meResponse } = useGetMeQuery();
  const me = meResponse?.data;
  // Use a smaller page size for proper pagination
  const { pagination, goToPage, nextPage, previousPage, resetPagination } =
    useOrderPagination(20);

  // Track filter state at component level to determine query params
  const [filterStateForQuery, setFilterStateForQuery] = useState({
    user: "all",
    status: "all",
    pickupDateRange: undefined as { from: Date | undefined; to: Date | undefined } | undefined,
    dropoffDateRange: undefined as { from: Date | undefined; to: Date | undefined } | undefined,
    search: "",
  });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filterStateForQuery.user !== "all" ||
      filterStateForQuery.status !== "all" ||
      filterStateForQuery.pickupDateRange?.from !== undefined ||
      filterStateForQuery.pickupDateRange?.to !== undefined ||
      filterStateForQuery.dropoffDateRange?.from !== undefined ||
      filterStateForQuery.dropoffDateRange?.to !== undefined ||
      (filterStateForQuery.search && filterStateForQuery.search.trim() !== "")
    );
  }, [filterStateForQuery]);

  // When filters are active, fetch all orders (use a very large limit)
  // When no filters, use server-side pagination
  const { data: ordersResponse, isLoading } = useGetOrdersQuery({
    page: hasActiveFilters ? 1 : pagination.page,
    limit: hasActiveFilters ? 10000 : pagination.limit, // Fetch all when filtering
  });

  const [bulkUpdateStatus, { isLoading: isUpdating }] =
    useBulkUpdateOrderStatusMutation();

  // Transform orders data
  const orders = useMemo(() => {
    const rawOrders =
      (Array.isArray(ordersResponse?.data?.data)
        ? ordersResponse.data.data
        : []) || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawOrders.map((record: any) => ({
      id: record.id,
      status: record.status || "PENDING",
      pickupDate: record.pickupDate || undefined,
      dropoffDate: record.dropoffDate || undefined,
      createdAt: record.createdAt,
      user: {
        firstName: record.user?.firstName,
        lastName: record.user?.lastName,
        email: record.user?.email,
      },
      route: {
        name: record.route?.name,
      },
      company: undefined,
    }));
  }, [ordersResponse?.data]);

  // Check if user is admin or manager
  const userRole = (me as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "COMPANY_MANAGER";

  // Initialize filters hook with the fetched orders
  const {
    filters,
    uniqueUsers,
    filteredOrders,
    handleFilterChange: originalHandleFilterChange,
    clearFilters: originalClearFilters,
  } = useDashboardFilters(orders);

  // Sync filter state for query determination
  useEffect(() => {
    setFilterStateForQuery({
      user: filters.user,
      status: filters.status,
      pickupDateRange: filters.pickupDateRange,
      dropoffDateRange: filters.dropoffDateRange,
      search: filters.search,
    });
  }, [filters]);

  // Wrap handleFilterChange to sync filter state
  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K]
  ) => {
    originalHandleFilterChange(key, value);
  };

  // Wrap clearFilters
  const clearFilters = () => {
    originalClearFilters();
  };

  // Apply client-side pagination to filtered orders when filters are active
  const paginatedFilteredOrders = useMemo(() => {
    if (!hasActiveFilters) {
      return filteredOrders; // Use all filtered orders (server already paginated)
    }
    // Apply client-side pagination to filtered results
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, pagination.page, pagination.limit, hasActiveFilters]);

  // Group orders by date (use paginated filtered orders when filters are active)
  const ordersToGroup = hasActiveFilters ? paginatedFilteredOrders : filteredOrders;
  const { groupedOrders, expandedGroups, toggleGroup } =
    useOrderGrouping(ordersToGroup);

  // Show all groups from the current page of orders
  const allGroups = Object.entries(groupedOrders);
  const paginatedGroups = allGroups;

  // Calculate totalPages based on whether filters are active
  const totalPages = useMemo(() => {
    if (hasActiveFilters) {
      // When filtering, calculate pages based on filtered results
      return Math.max(1, Math.ceil(filteredOrders.length / pagination.limit));
    }
    // When no filters, use server metadata
    return ordersResponse?.data?.meta?.totalPages || 1;
  }, [hasActiveFilters, filteredOrders.length, pagination.limit, ordersResponse?.data?.meta?.totalPages]);

  const {
    selectedOrders,
    toggleOrderSelection,
    toggleAllVisible,
    clearSelection,
  } = useOrderSelection(filteredOrders);

  // Helper functions
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "CONFIRMED":
        return "default";
      case "IN_TRANSIT":
        return "default";
      case "DELIVERED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const payload = {
        ids: Array.from(selectedOrders),
        status: newStatus,
      };
      await bulkUpdateStatus(payload).unwrap();
      clearSelection();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleFilterChangeWithReset = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K]
  ) => {
    handleFilterChange(key, value);
    resetPagination();
  };

  const isAllVisibleSelected = useMemo(() => {
    const visibleOrderIds = paginatedGroups.flatMap(([, orders]) =>
      orders.map((order) => order.id)
    );
    return (
      paginatedGroups.length > 0 &&
      visibleOrderIds.every((id) => selectedOrders.has(id))
    );
  }, [paginatedGroups, selectedOrders]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pickup Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "request" : "requests"} found
          </p>
        </div>
      </div>

      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedOrders.size}
        statusOptions={statusOptions}
        onStatusUpdate={handleBulkStatusUpdate}
        onClear={clearSelection}
        isUpdating={isUpdating}
      />

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        uniqueUsers={uniqueUsers}
        statusOptions={statusOptions}
        onFilterChange={handleFilterChangeWithReset}
        onClearFilters={() => {
          clearFilters();
          resetPagination();
        }}
      />

      {/* Orders Table */}
      <OrdersTable
        paginatedGroups={paginatedGroups}
        expandedGroups={expandedGroups}
        selectedOrders={selectedOrders}
        onToggleGroup={toggleGroup}
        onToggleOrderSelection={toggleOrderSelection}
        onToggleAllVisible={() => {
          const visibleOrderIds = paginatedGroups.flatMap(([, orders]) =>
            orders.map((order) => order.id)
          );
          toggleAllVisible(visibleOrderIds);
        }}
        isAllVisibleSelected={isAllVisibleSelected}
        getStatusBadgeVariant={getStatusBadgeVariant}
      />

      {/* Pagination */}
      <DashboardPagination
        currentPage={pagination.page}
        totalPages={totalPages}
        onPageChange={goToPage}
        onPrevious={previousPage}
        onNext={nextPage}
      />
    </div>
  );
}
