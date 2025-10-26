import { useGetMeQuery } from "@/modules/customers/customers.api";
import { motion } from "motion/react";
import { SubscriptionsHeader } from "./subscriptions-header";
import { SubscriptionsList } from "./subscriptions-list";
import { SubscriptionsLoadingSkeleton } from "./subscriptions-loading-skeleton";
import { SubscriptionsEmptyState } from "./subscriptions-empty-state";
import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";
import { useSubscriptionActions } from "./use-subscription-actions";

export default function SubscriptionsPage() {
  const { data: customerData } = useGetMeQuery();
  const {
    handleCancelRuleClick,
    handleActivateRuleClick,
    handleConfirmRuleCancel,
    closeCancelDialog,
    cancelRuleDialogOpen,
    selectedRule,
    isToggling,
  } = useSubscriptionActions();

  const customerId = customerData?.data?.id;
  const loading = !customerData;

  return (
    <>
      <motion.div
        className="space-y-6 pb-6 sm:pb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <SubscriptionsHeader />

        <div className="relative">
          {loading ? (
            <SubscriptionsLoadingSkeleton />
          ) : customerId ? (
            <SubscriptionsList
              customerId={customerId}
              onCancelRule={handleCancelRuleClick}
              onActivateRule={handleActivateRuleClick}
            />
          ) : (
            <SubscriptionsEmptyState />
          )}
        </div>
      </motion.div>

      <CancelSubscriptionDialog
        isOpen={cancelRuleDialogOpen}
        onClose={closeCancelDialog}
        onConfirm={handleConfirmRuleCancel}
        isLoading={isToggling}
        subscriptionName={selectedRule?.name}
      />
    </>
  );
}
