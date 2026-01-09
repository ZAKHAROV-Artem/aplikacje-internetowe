import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ErrorBanner from "@/components/error-banner";
import { useGetOrdersQuery } from "@/modules/pickup-requests/pickup-requests.api";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import { Plus, Package } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { motion } from "motion/react";

export default function HomePage() {
  const { data: orders, isFetching, error } = useGetOrdersQuery({});
  const status = isFetching ? "loading" : "succeeded";
  const { data: customer } = useGetMeQuery();

  // Normalize RTK Query error to string for ErrorBanner
  const errorText = (() => {
    const e = error as FetchBaseQueryError | SerializedError | undefined;
    if (!e) return null;
    if ("status" in (e as FetchBaseQueryError)) {
      const fe = e as FetchBaseQueryError;
      if (typeof fe.data === "string") return fe.data;
      if (typeof fe.data === "object") return JSON.stringify(fe.data);
      return `Failed to load pickup requests (${String(fe.status)})`;
    }
    const se = e as SerializedError;
    return se.message ?? "Failed to load pickup requests";
  })();

  const firstName = customer?.data?.firstName || "there";

  const records = orders?.data?.data || [];
  const totalOrders = records.length;

  // Count orders by status - focusing on pickup requests since that's what we display
  type OrderRecord = typeof records[0];

  const pendingOrders = records.filter(
    (pr: OrderRecord) => pr.status === "new" || !pr.status
  ).length;
  const completedOrders = records.filter(
    (pr: OrderRecord) => pr.status === "completed"
  ).length;

  // Show recent records (limit to 3)
  const recentRecords = records.slice(0, 3);

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

  return (
    <motion.div
      className="space-y-3 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Error Banner */}
      <ErrorBanner error={errorText} />

      {/* Greeting Section */}
      <div className="text-center space-y-2">
        <div className="flex items-baseline justify-center space-x-2">
          <div className="text-lg sm:text-2xl text-muted-foreground font-normal">
            Hi <span className="font-bold">{firstName},</span>
            <br />
            how can we help you today?
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-md p-2 border border-primary/20">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center rounded-lg p-3  bg-card/50">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {totalOrders}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
              Total Orders
            </div>
          </div>
          <div className="text-center rounded-lg p-3 bg-card/50">
            <div className="text-xl sm:text-2xl font-bold text-muted-foreground">
              {pendingOrders}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
              Pending
            </div>
          </div>
          <div className="text-center rounded-lg p-3  bg-card/50">
            <div className="text-xl sm:text-2xl font-bold text-secondary">
              {completedOrders}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
              Completed
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border shadow-none rounded-md border-primary/20 hover:border-primary/40 transition-all duration-200 cursor-pointer group active:scale-[0.98]">
        <CardContent className="p-2">
          <Link to="/new" className="block">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  New Pickup
                </h3>
                <p className="text-sm text-muted-foreground">
                  Schedule a pickup
                </p>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {recentRecords.length > 0 && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders" className="text-primary hover:text-primary/80">
                View all
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {recentRecords.map((record: OrderRecord) => {
              // For now, we'll display pickup requests. In the future, we can handle orders and drop-off requests
              const displayData = record;
              if (!displayData) return null;

              return (
                <Card
                  key={record.id}
                  className="hover:shadow-md transition-all duration-300 border active:scale-[0.98] rounded-md shadow-none bg-card"
                >
                  <CardContent className="p-4">
                    <Link to={`/orders/${record.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {record.location?.name ||
                              `${record.user?.firstName ?? ""} ${
                                record.user?.lastName ?? ""
                              }`.trim() ||
                              "Pickup request"}
                          </h3>
                          <div className="flex items-center mt-1 gap-2">
                            <div className="text-xs text-muted-foreground truncate">
                              {record.location
                                ? `${record.location.city}, ${record.location.state}`
                                : "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created: {formatDate(typeof displayData.createdAt === 'string' ? displayData.createdAt : displayData.createdAt?.toString())}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Drop-off:{" "}
                              {formatDate(typeof displayData.dropoffDate === 'string' ? displayData.dropoffDate : displayData.dropoffDate?.toString())}
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
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {status === "succeeded" && records.length === 0 && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by scheduling your first pickup
            </p>
            <Button asChild>
              <Link to="/new">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Pickup
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
