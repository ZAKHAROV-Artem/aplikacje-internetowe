import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ErrorBanner from "@/components/error-banner";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { useGetOrderByIdQuery } from "@/modules/pickup-requests/pickup-requests.api";
import { MapPin, Phone, ArrowLeft, Package, Mail } from "lucide-react";
import dayjs from "dayjs";
import { motion } from "motion/react";

// Status configuration for different pickup request statuses
const getStatusConfig = (status: string) => {
  const statusLower = status.toLowerCase();

  if (statusLower.includes("new") || statusLower.includes("pending")) {
    return {
      variant: "outline" as const,
      color: "text-muted-foreground",
      bgColor: "bg-muted border-border",
    };
  }
  if (statusLower.includes("scheduled") || statusLower.includes("confirmed")) {
    return {
      variant: "default" as const,
      color: "text-primary-foreground",
      bgColor: "bg-primary",
    };
  }
  if (statusLower.includes("completed") || statusLower.includes("delivered")) {
    return {
      variant: "secondary" as const,
      color: "text-secondary-foreground",
      bgColor: "bg-secondary border-secondary",
    };
  }
  if (statusLower.includes("cancelled") || statusLower.includes("rejected")) {
    return {
      variant: "destructive" as const,
      color: "text-destructive-foreground",
      bgColor: "bg-destructive border-destructive",
    };
  }

  return {
    variant: "outline" as const,
    color: "text-muted-foreground",
    bgColor: "bg-muted border-border",
  };
};

const LoadingSkeleton = () => (
  <div className="mx-auto w-full space-y-4">
    <div className="animate-pulse">
      <div className="h-6 bg-muted rounded w-48 mb-1"></div>
      <div className="h-3 bg-muted rounded w-64"></div>
    </div>

    <div className="space-y-6 w-full">
      {/* Status skeleton */}
      <Card className="animate-pulse border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="h-8 bg-muted rounded-full w-48 mx-auto"></div>
            <div className="h-8 bg-muted rounded w-64 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </CardContent>
      </Card>

      {/* Address skeleton */}
      <Card className="animate-pulse border-border bg-card">
        <CardHeader className="pb-4">
          <div className="h-6 bg-muted rounded w-40"></div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>

      {/* Service details skeleton */}
      <Card className="animate-pulse border-border bg-card">
        <CardHeader className="pb-4">
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="h-3 bg-muted rounded w-64"></div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
          </div>
        </CardContent>
      </Card>

      {/* Contact skeleton */}
      <Card className="animate-pulse border-border bg-card">
        <CardHeader className="pb-4">
          <div className="h-6 bg-muted rounded w-24"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-48 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function OrderDetailPage() {
  const { id } = useParams();
  const {
    data: orderResponse,
    isFetching,
    error,
  } = useGetOrderByIdQuery(id as string, { skip: !id });
  const order = orderResponse?.data;

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

  if (!id) return <ErrorBanner error="Missing order id" />;
  if (isFetching || !order) return <LoadingSkeleton />;

  const statusConfig = getStatusConfig(order.status || "unknown");

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/orders" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Badge
          variant={statusConfig.variant}
          className={`${statusConfig.bgColor} ${statusConfig.color} font-medium capitalize text-sm px-3 py-1`}
        >
          {order.status || "Unknown"}
        </Badge>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          {order.address?.name || "Pickup Request"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Order #{order.id ? order.id.slice(-8).toUpperCase() : "N/A"} • Created{" "}
          {order.updatedAt
            ? dayjs(order.updatedAt).format("MMM D, YYYY")
            : "N/A"}
        </p>
      </div>

      <ErrorBanner error={errorText} />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Pickup Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Pickup Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg text-foreground mb-2">
              {order.address?.name}
            </p>
            <div className="text-muted-foreground space-y-1 mb-4">
              <p>{order.address?.address1}</p>
              {order.address?.address2 && <p>{order.address.address2}</p>}
              <p>
                {order.address?.city}, {order.address?.state}{" "}
                {order.address?.zip}
              </p>
            </div>

            {/* Pickup Details */}
            {order.metadata && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex flex-wrap gap-4 text-sm">
                  {order.metadata.pickupPartOfDay && (
                    <span>
                      <span className="text-muted-foreground">Pickup:</span>
                      <span className="ml-1 font-medium">
                        {String(order.metadata.pickupPartOfDay)}
                      </span>
                    </span>
                  )}
                  {order.metadata.dropoffPartOfDay && (
                    <span>
                      <span className="text-muted-foreground">Drop-off:</span>
                      <span className="ml-1 font-medium">
                        {String(order.metadata.dropoffPartOfDay)}
                      </span>
                    </span>
                  )}
                  {order.route && (
                    <span>
                      <span className="text-muted-foreground">Route:</span>
                      <span className="ml-1 font-medium">
                        {order.route.name}
                      </span>
                    </span>
                  )}
                </div>
                {order.metadata.notes && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground text-sm">
                      Notes:
                    </span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {String(order.metadata.notes).replace(/\\n/g, "\n")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-primary" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 justify-start"
                asChild
              >
                <a href="tel:+1-555-0123" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium">(555) 012-3456</span>
                </a>
              </Button>

              <Button
                variant="outline"
                className="flex-1 justify-start"
                asChild
              >
                <a
                  href="mailto:support@magnoli.com"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-medium">support@magnoli.com</span>
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Mon-Fri, 8AM-6PM EST
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
