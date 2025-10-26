import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ErrorBanner from "@/components/error-banner";
import { useGetOrdersQuery } from "@/modules/pickup-requests/pickup-requests.api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { CrmOrderRecord } from "magnoli-types";
import { Package, Plus } from "lucide-react";
import dayjs from "dayjs";
import { motion } from "motion/react";

const getStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-secondary text-secondary-foreground border-secondary";
    case "scheduled":
      return "bg-primary text-primary-foreground border-primary";
    case "cancelled":
      return "bg-destructive text-destructive-foreground border-destructive";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const date = dayjs(dateStr);
  if (!date.isValid()) return "—";
  return date.format("MMM D");
};

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="animate-pulse border-0 shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded-md w-40"></div>
              <div className="flex items-center gap-2">
                <div className="h-3 bg-muted rounded w-28"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-muted rounded-full w-20"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 sm:py-16 px-4">
    <div className=" p-6 sm:p-8 max-w-md mx-auto">
      <div className="bg-primary rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 shadow-sm">
        <Package className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
        No orders yet
      </h3>
      <p className="text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
        You haven't created any pickup requests yet. Get started by creating
        your first order and we'll take care of the rest.
      </p>
      <Button
        asChild
        size="default"
        className="sm:size-lg shadow-sm w-full sm:w-auto"
      >
        <Link
          to="/new"
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Create your first order
        </Link>
      </Button>
    </div>
  </div>
);

const OrderCard = ({ record }: { record: CrmOrderRecord }) => {
  // For now, we'll display pickup requests. In the future, we can handle orders and drop-off requests
  const displayData = record.pickupRequest;
  if (!displayData) return null;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 active:scale-[0.98] border-0 shadow-sm bg-card">
      <CardContent className="p-4">
        <Link to={`/orders/${record.id}`} className="block">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {record.address?.name ||
                  `${record.customer?.firstName ?? ""} ${
                    record.customer?.lastName ?? ""
                  }`.trim() ||
                  "Pickup request"}
              </h3>
              <div className="flex items-center mt-1 gap-2">
                <div className="text-xs text-muted-foreground truncate">
                  {record.address
                    ? `${record.address.city}, ${record.address.state}`
                    : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Created: {formatDate(displayData.updatedAt)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Drop-off: {formatDate(displayData.dueDate || undefined)}
                </div>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(
                displayData.status
              )} flex-shrink-0 ml-3`}
            >
              {displayData.status || "pending"}
            </Badge>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default function OrdersPage() {
  const {
    data: ordersResponse,
    isFetching: loading,
    error,
  } = useGetOrdersQuery();
  const items = ordersResponse?.data?.records ?? [];

  const errorText = (() => {
    const e = error as FetchBaseQueryError | SerializedError | undefined;
    if (!e) return null;
    if ("status" in (e as FetchBaseQueryError)) {
      const fe = e as FetchBaseQueryError;
      if (typeof fe.data === "string") return fe.data;
      if (typeof fe.data === "object") return JSON.stringify(fe.data);
      return `Request failed (${String(fe.status)})`;
    }
    const se = e as SerializedError;
    return se.message ?? "Something went wrong";
  })();

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 pb-6 sm:pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Your Orders
        </h1>
        <Button asChild size="default" className="sm:size-lg px-4 sm:px-6">
          <Link
            to="/new"
            className="inline-flex items-center justify-center gap-2 sm:gap-2.5 font-medium"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Error Banner */}
      <ErrorBanner error={errorText} />

      {/* Content */}
      <div className="relative">
        {loading ? (
          <LoadingSkeleton />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">
                {items.length} {items.length === 1 ? "order" : "orders"} found
              </p>
            </div>
            <div className="space-y-2">
              {items.map((record) => (
                <OrderCard key={record.id} record={record} />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
