import { useGetCustomerRulesQuery } from "@/modules/customers/customers.api";
import type { DisplayRule } from "./types";
import { SubscriptionCard } from "./subscription-card";
import { SubscriptionsLoadingSkeleton } from "./subscriptions-loading-skeleton";
import { SubscriptionsEmptyState } from "./subscriptions-empty-state";

interface SubscriptionsListProps {
  customerId: string;
  onCancelRule: (id: string, name: string) => void;
  onActivateRule: (id: string) => void;
}

export const SubscriptionsList = ({
  customerId,
  onCancelRule,
  onActivateRule,
}: SubscriptionsListProps) => {
  const {
    data: rulesResponse,
    isLoading,
    error,
  } = useGetCustomerRulesQuery(customerId);

  if (isLoading) {
    return <SubscriptionsLoadingSkeleton />;
  }

  if (error) {
    return null;
  }

  const rules = rulesResponse?.data ?? [];
  const displayRules = rules as DisplayRule[];

  if (displayRules.length === 0) {
    return <SubscriptionsEmptyState />;
  }

  return (
    <div className="space-y-2">
      {displayRules.map((rule) => (
        <SubscriptionCard
          key={rule.id}
          rule={rule}
          onCancel={onCancelRule}
          onActivate={onActivateRule}
        />
      ))}
    </div>
  );
};
