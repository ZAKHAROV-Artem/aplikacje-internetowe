import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search } from "lucide-react";
import type { FilterState } from "../types";

interface StatusOption {
  value: string;
  label: string;
}

interface DashboardFiltersProps {
  filters: FilterState;
  uniqueUsers: string[];
  statusOptions: StatusOption[];
  onFilterChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  onClearFilters: () => void;
}

export function DashboardFilters({
  filters,
  uniqueUsers,
  statusOptions,
  onFilterChange,
  onClearFilters,
}: DashboardFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by user, route, company, or status..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* User Filter */}
        <div className="space-y-2">
          <Label htmlFor="user">User</Label>
          <Select
            value={filters.user}
            onValueChange={(value) => onFilterChange("user", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pickup Date Range */}
        <div className="space-y-2 col-span-2">
          <Label>Pickup Date Range</Label>
          <DateRangePicker
            dateRange={filters.pickupDateRange}
            onDateRangeChange={(range) =>
              onFilterChange("pickupDateRange", range)
            }
            showQuickActions={false}
            showTips={false}
          />
        </div>

        {/* Dropoff Date Range */}
        <div className="space-y-2 col-span-2">
          <Label>Dropoff Date Range</Label>
          <DateRangePicker
            dateRange={filters.dropoffDateRange}
            onDateRangeChange={(range) =>
              onFilterChange("dropoffDateRange", range)
            }
            showQuickActions={false}
            showTips={false}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
