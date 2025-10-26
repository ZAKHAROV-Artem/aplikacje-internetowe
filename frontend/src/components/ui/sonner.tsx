import { Toaster as Sonner } from "sonner";
import { useSelector } from "@/store";
import type { ComponentProps } from "react";

const Toaster = ({ ...props }: ComponentProps<typeof Sonner>) => {
  const theme = useSelector((state) => state?.settings?.theme) as
    | "light"
    | "dark"
    | undefined;

  return (
    <Sonner
      theme={theme === "dark" ? "dark" : "light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
