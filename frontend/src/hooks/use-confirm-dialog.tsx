import { useState } from "react";
import {
  ConfirmDialog,
  type ConfirmDialogProps,
} from "@/components/ui/confirm-dialog";

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmDialogProps>>({});

  const confirm = (
    props: Omit<ConfirmDialogProps, "open" | "onOpenChange">
  ) => {
    setConfig(props as Partial<ConfirmDialogProps>);
    setOpen(true);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={config.title || ""}
      onConfirm={config.onConfirm || (() => {})}
      {...config}
    />
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
