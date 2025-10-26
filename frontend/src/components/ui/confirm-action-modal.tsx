import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

interface ConfirmActionModalContentProps {
  cancelText?: string;
  children?: ReactNode;
  confirmClassName?: string;
  confirmText?: string;
  description?: string;
  onConfirm: () => void;
  title?: string;
  variant?: "default" | "destructive";
}

interface ConfirmActionModalRootProps {
  children: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ConfirmActionModalTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

function ConfirmActionModalContent({
  cancelText = "Cancel",
  children,
  confirmClassName,
  confirmText = "Confirm",
  description,
  onConfirm,
  title,
  variant = "default",
}: ConfirmActionModalContentProps) {
  if (children) {
    return <AlertDialogContent>{children}</AlertDialogContent>;
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelText}</AlertDialogCancel>
        <AlertDialogAction
          className={`${
            variant === "destructive"
              ? "bg-destructive hover:bg-destructive/90"
              : ""
          } ${confirmClassName ?? ""}`}
          onClick={onConfirm}
        >
          {confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

function ConfirmActionModalRoot({
  children,
  defaultOpen,
  onOpenChange,
}: ConfirmActionModalRootProps) {
  return (
    <AlertDialog defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </AlertDialog>
  );
}

function ConfirmActionModalTrigger({
  asChild,
  children,
}: ConfirmActionModalTriggerProps) {
  return <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>;
}

// Compound components
export const ConfirmActionModal = {
  Content: ConfirmActionModalContent,
  Root: ConfirmActionModalRoot,
  Trigger: ConfirmActionModalTrigger,
};

// Legacy support for existing usage
export function LegacyConfirmActionModal({
  cancelText = "Cancel",
  confirmText = "Confirm",
  description,
  isOpen,
  onClose,
  onConfirm,
  title,
  variant = "default",
}: {
  cancelText?: string;
  confirmText?: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  variant?: "default" | "destructive";
}) {
  return (
    <AlertDialog onOpenChange={onClose} open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90"
                : ""
            }
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
