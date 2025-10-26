import { motion } from "motion/react";

export default function ProgressBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="w-full">
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-2 bg-primary"
          initial={false}
          animate={{ width: step === 1 ? "50%" : "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Step 1: Name</span>
        <span>Step 2: Address</span>
      </div>
    </div>
  );
}
