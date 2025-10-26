import { RefreshCw } from "lucide-react";

export const SubscriptionsEmptyState = () => (
  <div className="text-center py-12 sm:py-16 px-4">
    <div className="p-6 sm:p-8 max-w-md mx-auto">
      <div className="bg-primary rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 shadow-sm">
        <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
        No active subscriptions
      </h3>
      <p className="text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
        You don't have any recurring pickups scheduled. Create a new pickup
        request and select "Make this a recurring pickup" to set up a
        subscription.
      </p>
    </div>
  </div>
);
