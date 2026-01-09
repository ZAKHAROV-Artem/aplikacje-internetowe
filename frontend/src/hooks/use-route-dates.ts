import { useEffect, useMemo, useRef } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useGetRoutesByZipQuery,
  type Route,
} from "@/modules/pickup-requests/routes.api";

// Map weekday strings to dayjs day numbers (0=Sunday, 1=Monday, etc.)
const WEEKDAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

type SetValue = (
  name: "routeId" | "pickupDate" | "dropoffDate",
  value: unknown,
  options?: {
    shouldDirty?: boolean;
    shouldTouch?: boolean;
    shouldValidate?: boolean;
  }
) => void;

export function useRouteDates({
  zipCode,
  addressComplete,
  routeId,
  pickupDate,
  dropoffDate,
  setValue,
}: {
  zipCode: string;
  addressComplete: boolean;
  routeId?: string;
  pickupDate?: Date;
  dropoffDate?: Date;
  setValue: SetValue;
}) {
  const debouncedZip = useDebounce(zipCode ?? "", 500);
  const routesResp = useGetRoutesByZipQuery(debouncedZip, {
    skip: !debouncedZip || debouncedZip.length < 5,
  });

  const routes: Route[] = Array.isArray(routesResp.data?.data?.data)
    ? routesResp.data.data.data
    : [];

  const hasRoutes = routes.length > 0;
  const noRoutesAvailable =
    addressComplete &&
    !routesResp.isLoading &&
    !routesResp.isFetching &&
    !hasRoutes &&
    debouncedZip.length >= 5;

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === routeId) || null,
    [routes, routeId]
  );

  // Convert weekday strings ("Monday", "Tuesday", etc.) to dayjs day numbers (0=Sunday, 1=Monday, etc.)
  const allowedWeekdays: number[] = useMemo(() => {
    if (!selectedRoute?.weekdays || selectedRoute.weekdays.length === 0) {
      return []; // Empty array means all days are allowed
    }
    return selectedRoute.weekdays
      .map((day) => WEEKDAY_MAP[day])
      .filter((day) => day !== undefined) as number[];
  }, [selectedRoute?.weekdays]);

  const slaDays: number = selectedRoute?.pricelist?.slaDays ?? 1;
  const today = dayjs().startOf("day");

  const pickupTouchedRef = useRef(false);
  const dropOffTouchedRef = useRef(false);

  // Create dates at local noon to avoid timezone boundary issues (UTC conversions)
  const toLocalNoon = (d: Dayjs): Date => {
    return new Date(d.year(), d.month(), d.date(), 12, 0, 0, 0);
  };

  const isWeekdayAllowed = (d: Dayjs) =>
    allowedWeekdays.length === 0 || allowedWeekdays.includes(d.day());

  function isValidDropoff(
    candidate: Date | undefined,
    pickup: Date | undefined
  ) {
    if (!candidate) return false;
    const d = dayjs(candidate).startOf("day");
    if (d.isSame(today, "day") || d.isBefore(today, "day")) return false; // Disable today and past dates
    if (pickup) {
      const p = dayjs(pickup).startOf("day");
      if (d.isSame(p, "day") || d.isBefore(p, "day")) return false;
      // Enforce SLA days minimum gap
      const daysDifference = d.diff(p, "day");
      if (daysDifference < slaDays) return false;
    }
    return isWeekdayAllowed(d);
  }

  const pickupDisabledDays = (date: Date) => {
    const d = dayjs(date).startOf("day");
    // Only allow next day and beyond (not today)
    if (d.isSame(today, "day") || d.isBefore(today, "day")) return true;
    return !isWeekdayAllowed(d);
  };

  const dropOffDisabledDays = (date: Date) => {
    const d = dayjs(date).startOf("day");
    if (d.isSame(today, "day") || d.isBefore(today, "day")) return true; // Disable today and past dates
    if (!isWeekdayAllowed(d)) return true;
    if (pickupDate) {
      const p = dayjs(pickupDate).startOf("day");
      if (d.isSame(p, "day") || d.isBefore(p, "day")) return true;
      // Enforce SLA days minimum gap
      const daysDifference = d.diff(p, "day");
      if (daysDifference < slaDays) return true;
    }
    return false;
  };

  // Auto-select the first route by default when routes are available, but only if not already selected
  const firstRouteId = useMemo(
    () => (routes.length > 0 ? routes[0].id : undefined),
    [routes]
  );

  useEffect(() => {
    if (firstRouteId && !routeId) {
      setValue("routeId", firstRouteId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [firstRouteId, routeId, setValue]);

  // Ensure pickup/dropoff remain valid when the selected route changes
  // Only auto-adjust if user hasn't manually set dates
  useEffect(() => {
    if (!selectedRoute) return;
    const now = dayjs().startOf("day");

    const p = pickupDate ? dayjs(pickupDate).startOf("day") : null;
    // When route is selected, pickup must be after today (next day or later)
    const pickupOk =
      p && p.isAfter(now, "day") && allowedWeekdays.includes(p.day());
    let ensuredPickup = p;

    // Only auto-adjust pickup if user hasn't manually set it
    if (!pickupOk && !pickupTouchedRef.current) {
      // Start from tomorrow (i=1) when route is selected, not today (i=0)
      for (let i = 1; i <= 42; i++) {
        const candidate = now.add(i, "day");
        if (allowedWeekdays.includes(candidate.day())) {
          ensuredPickup = candidate;
          setValue("pickupDate", toLocalNoon(candidate), {
            shouldDirty: true,
          });
          dropOffTouchedRef.current = false;
          break;
        }
      }
    }

    const pickupBase = ensuredPickup || p;
    if (pickupBase) {
      const keepUserDropoff =
        dropOffTouchedRef.current &&
        dropoffDate &&
        dayjs(dropoffDate).isAfter(pickupBase, "day") &&
        allowedWeekdays.includes(dayjs(dropoffDate).day());

      // Only auto-adjust dropoff if user hasn't manually set it
      if (!keepUserDropoff && !dropOffTouchedRef.current) {
        // Start from slaDays minimum gap
        for (let j = slaDays; j <= 42; j++) {
          const candidate = pickupBase.add(j, "day");
          if (allowedWeekdays.includes(candidate.day())) {
            setValue("dropoffDate", toLocalNoon(candidate), {
              shouldDirty: true,
            });
            break;
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, selectedRoute, allowedWeekdays.length, slaDays]);

  // Revalidate dates when routes are first fetched and loaded
  // Only runs once when routes are loaded, not on every date change
  useEffect(() => {
    if (
      !routesResp.isLoading &&
      !routesResp.isFetching &&
      hasRoutes &&
      selectedRoute &&
      !pickupTouchedRef.current &&
      !dropOffTouchedRef.current
    ) {
      const now = dayjs().startOf("day");

      const p = pickupDate ? dayjs(pickupDate).startOf("day") : null;
      const d = dropoffDate ? dayjs(dropoffDate).startOf("day") : null;

      // Revalidate pickup date only if not manually set
      const pickupValid =
        p && p.isAfter(now, "day") && allowedWeekdays.includes(p.day());
      if (!pickupValid && p && !pickupTouchedRef.current) {
        // Find next valid pickup date
        for (let i = 1; i <= 42; i++) {
          const candidate = now.add(i, "day");
          if (allowedWeekdays.includes(candidate.day())) {
            setValue("pickupDate", toLocalNoon(candidate), {
              shouldDirty: true,
            });
            dropOffTouchedRef.current = false;
            break;
          }
        }
      }

      // Revalidate dropoff date only if not manually set
      const pickupBase = p || now.add(1, "day");
      const dropoffValid =
        d &&
        d.isAfter(pickupBase, "day") &&
        d.diff(pickupBase, "day") >= slaDays &&
        allowedWeekdays.includes(d.day());

      if (!dropoffValid && d && !dropOffTouchedRef.current) {
        // Find next valid dropoff date
        for (let j = slaDays; j <= 42; j++) {
          const candidate = pickupBase.add(j, "day");
          if (allowedWeekdays.includes(candidate.day())) {
            setValue("dropoffDate", toLocalNoon(candidate), {
              shouldDirty: true,
            });
            dropOffTouchedRef.current = false;
            break;
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routesResp.isLoading, routesResp.isFetching, hasRoutes, selectedRoute]);

  // Enforce dropoff validity whenever pickup changes under a selected route
  // Only auto-adjust dropoff if user hasn't manually set it
  useEffect(() => {
    if (!selectedRoute) return;
    const p = pickupDate ? dayjs(pickupDate).startOf("day") : null;
    const d = dropoffDate ? dayjs(dropoffDate).startOf("day") : null;
    if (!p) return;

    const dropoffValid =
      !!d &&
      d.isAfter(p, "day") &&
      d.diff(p, "day") >= slaDays &&
      isWeekdayAllowed(d);

    // Only auto-adjust if dropoff is invalid AND user hasn't manually set it
    if (!dropoffValid && !dropOffTouchedRef.current) {
      for (let j = Math.max(1, slaDays); j <= 42; j++) {
        const candidate = p.add(j, "day");
        if (isWeekdayAllowed(candidate)) {
          setValue("dropoffDate", toLocalNoon(candidate), {
            shouldDirty: true,
          });
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupDate, selectedRoute, slaDays, allowedWeekdays.join(",")]);

  // Fallback when no route is selected/found: default to tomorrow and day after
  useEffect(() => {
    if (selectedRoute) return; // Only apply when no route
    const now = dayjs().startOf("day");

    const currentPickup = pickupDate ? dayjs(pickupDate).startOf("day") : null;
    let ensuredPickup = currentPickup;

    if (!currentPickup || !currentPickup.isAfter(now, "day")) {
      const tomorrow = now.add(1, "day");
      ensuredPickup = tomorrow;
      setValue("pickupDate", toLocalNoon(tomorrow), { shouldDirty: true });
    }

    const base = ensuredPickup || now.add(1, "day");
    const currentDropoff = dropoffDate
      ? dayjs(dropoffDate).startOf("day")
      : null;
    if (!currentDropoff || !currentDropoff.isAfter(base, "day")) {
      const dayAfter = base.add(1, "day");
      setValue("dropoffDate", toLocalNoon(dayAfter), { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoute, pickupDate, dropoffDate]);

  function onRouteChange() {
    // Reset touched refs when route changes so dates can auto-adjust for new route
    pickupTouchedRef.current = false;
    dropOffTouchedRef.current = false;
  }

  function onPickupChange(date: Date | undefined) {
    if (date) {
      pickupTouchedRef.current = true;
    }
    if (!date) return;
    // Only auto-adjust dropoff if user hasn't manually set it
    if (dropOffTouchedRef.current && isValidDropoff(dropoffDate, date)) {
      return;
    }
    if (!dropOffTouchedRef.current) {
      const base = dayjs(date).startOf("day");
      // Start from slaDays minimum gap
      for (let i = slaDays; i <= 42; i++) {
        const candidate = base.add(i, "day");
        if (
          isWeekdayAllowed(candidate) &&
          !candidate.isBefore(dayjs().startOf("day"), "day")
        ) {
          setValue("dropoffDate", toLocalNoon(candidate), {
            shouldDirty: true,
          });
          break;
        }
      }
    }
  }

  function onDropoffChange(date: Date | undefined) {
    if (date) dropOffTouchedRef.current = true;
  }

  return {
    routes,
    hasRoutes,
    noRoutesAvailable,
    routesResp,
    selectedRoute,
    allowedWeekdays,
    pickupDisabledDays,
    dropOffDisabledDays,
    onRouteChange,
    onPickupChange,
    onDropoffChange,
  };
}
