import { NavLink, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useSelector } from "@/store";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import BurgerMenu from "./burger-menu";
import { LayoutDashboard, Users, Route, Building2, Home, Package, Plus } from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Get user data to check admin role
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  const me = meResponse?.data;

  // Check user role
  const userRole = (me as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "COMPANY_MANAGER";
  const isRegularUser = userRole === "USER";

  // Hide entirely when not authenticated
  if (!accessToken) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full border-t",
        "bg-card/98 border-border/60"
      )}
    >
      {/* Bottom bar with enhanced modern design */}
      <div className="safe-area-inset-bottom">
        <div className={cn("flex items-stretch h-14", "justify-between")}>
          {/* Admin Navigation items - show only for ADMIN */}
          {isAdmin && (
            <div className="flex items-stretch justify-around flex-1 gap-1">
              <NavLink
                to="/admin"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/admin" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/admin" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <LayoutDashboard
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/admin"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/admin"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Dashboard
                </span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/admin/users" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/admin/users" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Users
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/admin/users"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/admin/users"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Users
                </span>
              </NavLink>

              <NavLink
                to="/admin/routes"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/admin/routes" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/admin/routes" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Route
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/admin/routes"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/admin/routes"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Routes
                </span>
              </NavLink>

              <NavLink
                to="/admin/company"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/admin/company" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/admin/company" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Building2
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/admin/company"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/admin/company"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Company
                </span>
              </NavLink>
            </div>
          )}

          {/* Manager Navigation items - show Home, Orders, and Routes for MANAGER */}
          {isManager && (
            <div className="flex items-stretch justify-around flex-1 gap-1">
              <NavLink
                to="/home"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/home" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/home" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Home
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/home"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/home"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Home
                </span>
              </NavLink>

              <NavLink
                to="/orders"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname.startsWith("/orders") && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {!location.pathname.startsWith("/orders") && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Package
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname.startsWith("/orders")
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname.startsWith("/orders")
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Orders
                </span>
              </NavLink>

              <NavLink
                to="/admin/routes"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/admin/routes" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/admin/routes" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Route
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/admin/routes"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/admin/routes"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Routes
                </span>
              </NavLink>
            </div>
          )}

          {/* Regular User Navigation items - show for regular users */}
          {isRegularUser && (
            <div className="flex items-stretch justify-around flex-1 gap-1">
              <NavLink
                to="/new"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/new" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/new" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Plus
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/new"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/new"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  New
                </span>
              </NavLink>

              <NavLink
                to="/home"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname === "/home" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {location.pathname !== "/home" && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Home
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname === "/home"
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname === "/home"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Home
                </span>
              </NavLink>

              <NavLink
                to="/orders"
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 min-w-0 flex-1 relative group",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {location.pathname.startsWith("/orders") && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10",
                      "shadow-lg shadow-primary/20 border border-primary/20"
                    )}
                  />
                )}

                {!location.pathname.startsWith("/orders") && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Package
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      location.pathname.startsWith("/orders")
                        ? "text-primary drop-shadow-sm"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 relative z-10 tracking-wide",
                    location.pathname.startsWith("/orders")
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  Orders
                </span>
              </NavLink>
            </div>
          )}

          {/* Burger Menu - always show */}
          <BurgerMenu />
        </div>
      </div>
    </nav>
  );
}
