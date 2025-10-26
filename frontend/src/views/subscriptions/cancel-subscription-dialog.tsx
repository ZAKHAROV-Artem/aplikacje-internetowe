import { LegacyConfirmActionModal } from "@/components/ui/confirm-action-modal";

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  subscriptionName?: string;
}

export const CancelSubscriptionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  subscriptionName,
}: CancelSubscriptionDialogProps) => (
  <LegacyConfirmActionModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Cancel recurring pickup rule?"
    description={`Are you sure you want to cancel "${subscriptionName}"? This will stop all future recurring pickups for this rule. This action cannot be undone.`}
    confirmText={isLoading ? "Cancelling..." : "Cancel rule"}
    cancelText="Keep rule"
    variant="destructive"
  />
);
