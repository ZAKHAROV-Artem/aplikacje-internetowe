import { useState } from "react";
import { toast } from "sonner";
import { useToggleCustomerRuleMutation } from "@/modules/customers/customers.api";

export const useSubscriptionActions = () => {
  const [toggleRule, { isLoading: isToggling }] =
    useToggleCustomerRuleMutation();
  const [cancelRuleDialogOpen, setCancelRuleDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCancelRuleClick = (id: string, name: string) => {
    setSelectedRule({ id, name });
    setCancelRuleDialogOpen(true);
  };

  const handleActivateRuleClick = async (id: string) => {
    try {
      await toggleRule({ ruleId: id, isActive: true }).unwrap();
      toast.success("Rule activated successfully");
    } catch {
      toast.error("Failed to activate rule. Please try again.");
    }
  };

  const handleConfirmRuleCancel = async () => {
    if (!selectedRule) return;

    try {
      await toggleRule({ ruleId: selectedRule.id, isActive: false }).unwrap();
      toast.success("Rule cancelled successfully");
      setCancelRuleDialogOpen(false);
      setSelectedRule(null);
    } catch {
      toast.error("Failed to cancel rule. Please try again.");
    }
  };

  const closeCancelDialog = () => {
    if (!isToggling) {
      setCancelRuleDialogOpen(false);
    }
  };

  return {
    handleCancelRuleClick,
    handleActivateRuleClick,
    handleConfirmRuleCancel,
    closeCancelDialog,
    cancelRuleDialogOpen,
    selectedRule,
    isToggling,
  };
};
