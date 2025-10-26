import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, X, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default" | "warning" | "info";
  icon?: React.ComponentType<{ className?: string }>;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const variantConfig = {
  destructive: {
    icon: Trash2,
    confirmButtonVariant: "destructive" as const,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    confirmButtonVariant: "destructive" as const,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/20",
  },
  info: {
    icon: Info,
    confirmButtonVariant: "default" as const,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
  },
  default: {
    icon: CheckCircle,
    confirmButtonVariant: "default" as const,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  icon,
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = variantConfig[variant];
  const IconComponent = (icon || config.icon) as React.ComponentType<{
    className?: string;
  }>;

  const handleConfirm = async () => {
    if (loading || disabled) return;

    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in confirm action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  // Reset loading state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                config.iconBg
              )}
            >
              <IconComponent className={cn("h-6 w-6", config.iconColor)} />
            </div>
          </div>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || disabled}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            {cancelText}
          </Button>
          <Button
            variant={config.confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isLoading || disabled}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading...
              </>
            ) : (
              <>
                <IconComponent className="mr-2 h-4 w-4" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
