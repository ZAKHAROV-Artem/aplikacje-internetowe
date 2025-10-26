// Key functionality: Simple full-width layout that scales properly on all screen sizes
import { Outlet } from "react-router";
import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useGetHealthQuery } from "@/modules/health/health.api";
import ServiceDown from "@/views/service-down";
import { Toaster } from "./ui/sonner";
import Header from "./layout/header";
import MobileBottomNav from "./layout/mobile-bottom-nav";

export default function Layout() {
  // Health check: do not block unauthenticated pages from loading; we still want to show service-down
  const {
    data: health,
    isError: isHealthError,
    isFetching: isChecking,
  } = useGetHealthQuery();

  const showServiceDown =
    !isChecking && (isHealthError || health?.data?.status !== "ok");

  // Set light theme as default
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("light");
  }

  return (
    <div
      className={cn(
        " min-h-0 flex flex-col overflow-hidden bg-background text-foreground"
      )}
    >
      <Header />
      {/* If backend unhealthy, show service-down notice instead of app routes */}
      {showServiceDown ? (
        <div className={cn("w-full px-2 sm:px-6 lg:px-8 mt-4")}>
          <div className={cn("mx-auto max-w-7xl")}>
            <ServiceDown />
          </div>
        </div>
      ) : null}

      {/* Main Content - scrollable area */}
      <main
        className={cn(
          "flex-1 min-h-0 flex overflow-y-auto w-full max-w-7xl mx-auto px-3 py-2 pb-20"
        )}
      >
        <div className="mx-auto w-full min-h-0 flex flex-col">
          {/* Only render routes when health is ok or still checking */}
          {isChecking || (!isHealthError && health?.data?.status === "ok") ? (
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          ) : null}
        </div>
      </main>

      <MobileBottomNav />
      <Toaster position="bottom-right" />
    </div>
  );
}
