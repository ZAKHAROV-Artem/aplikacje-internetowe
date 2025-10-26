import { useNavigate } from "react-router";
import { Menu, User, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "@/store";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import { useGetOrdersQuery } from "@/modules/pickup-requests/pickup-requests.api";
import { useSignOutMutation } from "@/modules/auth/auth.api";
import { navItems } from "./constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BurgerMenu() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const { data: meResponse, refetch } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });
  const me = meResponse?.data;
  const navigate = useNavigate();

  // Check if user has orders
  const { data: ordersResponse } = useGetOrdersQuery(
    {},
    {
      skip: !accessToken,
    }
  );
  const records = ordersResponse?.data?.data;
  const hasOrders = (records?.length ?? 0) > 0;

  const [signOut] = useSignOutMutation();
  const handleLogout = (): void => {
    if (refreshToken) {
      signOut({ refreshToken: refreshToken as string });
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleUpdateInfo = async () => {
    try {
      const { data: freshMeResponse } = await refetch();
      const freshMe = freshMeResponse?.data;

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
          from: "/home",
        },
      });
    } catch {
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
          from: "/home",
        },
      });
    }
  };

  if (!accessToken) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-6 h-full transition-all duration-300 relative group",
            "active:scale-95"
          )}
        >
          <Menu className="h-5 w-5 transition-all duration-300 relative z-10 text-muted-foreground group-hover:text-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72"
        align="start"
        side="bottom"
        sideOffset={12}
      >
        {/* Main Navigation */}
        {!hasOrders && (
          <DropdownMenuItem onClick={() => handleNavigation("/new")}>
            <Plus className="h-4 w-4" />
            New Request
          </DropdownMenuItem>
        )}
        {hasOrders &&
          navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <DropdownMenuItem
                key={item.to}
                onClick={() => handleNavigation(item.to)}
              >
                <IconComponent className="h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleUpdateInfo}>
          <User className="h-4 w-4" />
          Update your info
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
