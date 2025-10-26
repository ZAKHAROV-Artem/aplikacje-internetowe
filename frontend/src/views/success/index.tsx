import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetOrderByIdQuery } from "@/modules/pickup-requests/pickup-requests.api";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import dayjs from "@/lib/dayjs";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Package,
  Home as HomeIcon,
} from "lucide-react";

export default function SuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data: orderResponse, isLoading } = useGetOrderByIdQuery(
    orderId as string,
    {
      skip: !orderId,
    }
  );
  const order = orderResponse?.data;
  const { data: customerResponse } = useGetMeQuery();

  const firstName = customerResponse?.data?.firstName || "there";

  useEffect(() => {
    if (!orderId) {
      navigate("/new");
      return;
    }
  }, [orderId, navigate]);

  const formatDate = (dateStr?: dayjs.ConfigType) => {
    if (!dateStr) return "—";
    const date = dayjs(dateStr);
    if (!date.isValid()) return "—";
    return date.format("dddd, MMMM D, YYYY");
  };

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pb-2 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-2xl mx-auto relative z-10">
        {/* Success Header */}
        <div className="text-center mb-4 md:mb-8">
          <div className="mb-3 md:mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10  rounded-full flex items-center justify-center mx-auto border-2 border-primary/20 ">
              <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-4">
            {firstName}, we got you!
          </h1>

          <p className="text-base md:text-lg text-muted-foreground">
            Your pickup has been scheduled successfully
          </p>
        </div>

        {/* Order Details Card */}
        <div>
          <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
            <CardContent className="p-4 md:p-6 lg:p-8">
              {/* Pickup Schedule */}
              <div className="space-y-4 md:space-y-6">
                <div className="text-center pb-3 md:pb-6 border-b border-border">
                  <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">
                    Here's your schedule
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    We'll come knock on your door. Please be on the lookout!
                  </p>
                </div>

                {/* Pickup Date */}
                {order.pickupDate && (
                  <div className="flex items-start space-x-3 p-3 md:p-4 bg-primary/5 rounded-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm md:text-base font-semibold text-foreground">
                        Pickup Date
                      </h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-base md:text-lg font-medium text-primary">
                          {formatDate(order.pickupDate)}
                          {order.metadata?.pickupPartOfDay &&
                            ` · ${order.metadata?.pickupPartOfDay}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Drop-off Date */}
                {order.dropoffDate && (
                  <div className="flex items-start space-x-3 p-3 md:p-4 bg-primary/5 rounded-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm md:text-base font-semibold text-foreground">
                        Drop-off Date
                      </h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-base md:text-lg font-medium text-primary">
                          {formatDate(order.dropoffDate)}
                          {order.metadata?.dropoffPartOfDay &&
                            ` · ${order.metadata?.dropoffPartOfDay}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Missing Dates Alert */}
                {(!order.pickupDate || !order.dropoffDate) && (
                  <div className="flex items-start space-x-3 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm md:text-base font-semibold text-amber-800">
                        Schedule Information Needed
                      </h3>
                      <p className="text-sm md:text-base text-amber-700 mb-2">
                        {!order.pickupDate && !order.dropoffDate
                          ? "We don't have your pickup or drop-off dates yet."
                          : !order.pickupDate
                          ? "We don't have your pickup date yet."
                          : "We don't have your drop-off date yet."}
                      </p>
                      <p className="text-xs md:text-sm text-amber-600">
                        Please call us at{" "}
                        <span className="font-semibold">(555) 123-4567</span> to
                        confirm your schedule.
                      </p>
                    </div>
                  </div>
                )}

                {/* Address */}
                <div className="flex items-start space-x-3 p-3 md:p-4 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm md:text-base font-semibold text-foreground">
                      Pickup Address
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {order.address
                        ? [
                            order.address.address1,
                            order.address.address2,
                            `${order.address.city}, ${order.address.state} ${order.address.zip}`,
                          ]
                            .filter(Boolean)
                            .join(", ")
                        : "Address unavailable"}
                    </p>
                  </div>
                </div>

                {/* Order Status */}
                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <span className="text-sm md:text-base font-medium">
                      Order Status:
                    </span>
                  </div>
                  <Badge className="text-xs md:text-sm">
                    {order.status || "Scheduled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-8">
          <Button asChild size="default" className="h-10 md:h-12">
            <Link to="/orders" className="flex items-center space-x-2">
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">View All Orders</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="default"
            className="h-10 md:h-12"
          >
            <Link to="/home" className="flex items-center space-x-2">
              <HomeIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Back to Home</span>
            </Link>
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-4 md:mt-8 p-4 md:p-6 bg-muted/30 rounded-lg">
          <h3 className="text-sm md:text-base font-semibold mb-2 md:mb-3">
            Need to make changes?
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-6 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Phone className="w-3 h-3 md:w-4 md:h-4" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3 h-3 md:w-4 md:h-4" />
              <span>support@alphillips.com</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
