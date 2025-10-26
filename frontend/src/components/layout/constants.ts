import { Home, Package } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  {
    to: "/home",
    label: "Home",
    icon: Home,
  },
  {
    to: "/orders",
    label: "Orders",
    icon: Package,
  },
];
