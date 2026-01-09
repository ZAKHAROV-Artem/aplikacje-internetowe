import { useNavigate } from "react-router";
import {
  ChevronDown,
  User,
  LogOut,
  Users,
  Route,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "@/store";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import { useSignOutMutation } from "@/modules/auth/auth.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileUserDropupProps {
  direction?: "up" | "down";
  showName?: boolean;
  variant?: "mobile" | "desktop";
  hideAdminLinks?: boolean;
}

export default function MobileUserDropup({
  direction = "up",
  showName = false,
  variant = "mobile",
  hideAdminLinks = false,
}: MobileUserDropupProps) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const { data: meResponse, refetch } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  const me = meResponse?.data;

  // Check user role
  const userRole = (me as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "COMPANY_MANAGER";
  const navigate = useNavigate();

  const [signOut] = useSignOutMutation();
  const handleLogout = (): void => {
    if (refreshToken) {
      signOut({ refreshToken: refreshToken as string });
    }
  };

  if (!me) {
    return (
      <button
        onClick={handleLogout}
        className="text-xs font-medium text-gray-600 px-3 py-2"
      >
        EXIT
      </button>
    );
  }

  const fullName =
    `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "User";
  const initials = fullName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 h-full transition-all duration-300 relative group",
            "active:scale-95"
          )}
        >
          {/* Trigger Content */}
          {showName ? (
            <span className="text-sm font-medium relative z-10 text-muted-foreground group-hover:text-foreground">
              {fullName}
            </span>
          ) : (
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-300 relative z-10",
                variant === "desktop"
                  ? "bg-muted text-muted-foreground group-hover:text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-foreground/10"
              )}
            >
              {initials}
            </div>
          )}

          <ChevronDown className="h-4 w-4 transition-all duration-300 relative z-10 text-muted-foreground group-hover:text-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72"
        align="end"
        side={direction === "up" ? "top" : "bottom"}
        sideOffset={12}
      >
        {/* Menu Items */}
        <DropdownMenuItem
          onClick={async () => {
            // Force a fresh fetch of user data to ensure we have the latest information
            try {
              const { data: freshMeResponse } = await refetch();
              const freshMe = freshMeResponse?.data;

              // Navigate to onboarding with preset fields from fresh user data
              const defaultOrFirstLocation = (() => {
                const list = (
                  freshMe as unknown as {
                    customerLocations?: import("@/modules/customers/customers.api").ApiCustomerLocation[];
                  }
                )?.customerLocations;
                if (!Array.isArray(list) || list.length === 0) return undefined;
                return list.find((l) => l.alias === "default") ?? list[0];
              })();

              const initialValues = freshMe
                ? {
                    firstName: freshMe.firstName || "",
                    lastName: freshMe.lastName || "",
                    street: defaultOrFirstLocation?.address1 || "",
                    city: defaultOrFirstLocation?.city || "",
                    stateVal: defaultOrFirstLocation?.state || "",
                    zip: defaultOrFirstLocation?.zip || "",
                  }
                : {};
              navigate("/onboarding", {
                state: {
                  initialValues,
                  from: "/home", // Redirect to home after completion
                },
              });
            } catch {
              // If refetch fails, fall back to cached data
              const defaultOrFirstLocation = (() => {
                const list = (
                  me as unknown as {
                    customerLocations?: import("@/modules/customers/customers.api").ApiCustomerLocation[];
                  }
                )?.customerLocations;
                if (!Array.isArray(list) || list.length === 0) return undefined;
                return list.find((l) => l.alias === "default") ?? list[0];
              })();

              const initialValues = me
                ? {
                    firstName: me.firstName || "",
                    lastName: me.lastName || "",
                    street: defaultOrFirstLocation?.address1 || "",
                    city: defaultOrFirstLocation?.city || "",
                    stateVal: defaultOrFirstLocation?.state || "",
                    zip: defaultOrFirstLocation?.zip || "",
                  }
                : {};
              navigate("/onboarding", {
                state: {
                  initialValues,
                  from: "/home", // Redirect to home after completion
                },
              });
            }
          }}
        >
          <User className="h-4 w-4" />
          Update your info
        </DropdownMenuItem>

        {/* Admin links - only show for ADMIN users and when not hidden */}
        {isAdmin && !hideAdminLinks && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/admin")}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/admin/users")}>
              <Users className="h-4 w-4" />
              Manage Users
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/admin/routes")}>
              <Route className="h-4 w-4" />
              Manage Routes
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/admin/company")}>
              <Building2 className="h-4 w-4" />
              Company Info
            </DropdownMenuItem>
          </>
        )}

        {/* Manager links - only show Routes for MANAGER users and when not hidden */}
        {isManager && !hideAdminLinks && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/admin/routes")}>
              <Route className="h-4 w-4" />
              Manage Routes
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
