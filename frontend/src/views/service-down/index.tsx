import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function ServiceDown() {
  return (
    <motion.div
      className={cn("w-full px-4 sm:px-6 lg:px-8 py-10")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "mx-auto max-w-2xl text-center rounded-lg border border-border p-8 bg-card"
        )}
      >
        <h1 className={cn("text-2xl font-semibold text-foreground")}>
          We’re having trouble right now
        </h1>
        <p className={cn("mt-3 text-sm text-muted-foreground")}>
          Our service is temporarily unavailable. Please try again in a moment.
        </p>
        <div className={cn("mt-6 text-xs text-muted-foreground")}>
          If this keeps happening, contact support.{" "}
          <a className={cn("text-primary")} href="mailto:support@magnoli.ai">
            support@magnoli.ai
          </a>
        </div>
      </div>
    </motion.div>
  );
}
