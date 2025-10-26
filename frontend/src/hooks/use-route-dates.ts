import { useEffect, useMemo, useRef } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useGetRoutesByZipQuery,
  type Route,
} from "@/modules/pickup-requests/routes.api";

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
  const allowedWeekdays: number[] = selectedRoute?.weekdays ?? [];
  const slaDays: number = selectedRoute?.pricelist?.slaDays ?? 1;
  const today = dayjs().startOf("day");

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

  // Auto-select when exactly one route is available, but only if not already selected
  const singleRouteId = useMemo(
    () => (routes.length === 1 ? routes[0].id : undefined),
    [routes]
  );

  useEffect(() => {
    if (singleRouteId && routeId !== singleRouteId) {
      setValue("routeId", singleRouteId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [singleRouteId, routeId, setValue]);

  // Ensure pickup/dropoff remain valid when the selected route changes
  useEffect(() => {
    if (!selectedRoute) return;
    const now = dayjs().startOf("day");

    const p = pickupDate ? dayjs(pickupDate).startOf("day") : null;
    // When route is selected, pickup must be after today (next day or later)
    const pickupOk =
      p && p.isAfter(now, "day") && allowedWeekdays.includes(p.day());
    let ensuredPickup = p;

    if (!pickupOk) {
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

      if (!keepUserDropoff) {
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
  useEffect(() => {
    if (
      !routesResp.isLoading &&
      !routesResp.isFetching &&
      hasRoutes &&
      selectedRoute
    ) {
      const now = dayjs().startOf("day");

      const p = pickupDate ? dayjs(pickupDate).startOf("day") : null;
      const d = dropoffDate ? dayjs(dropoffDate).startOf("day") : null;

      // Revalidate pickup date
      const pickupValid =
        p && p.isAfter(now, "day") && allowedWeekdays.includes(p.day());
      if (!pickupValid && p) {
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

      // Revalidate dropoff date
      const pickupBase = p || now.add(1, "day");
      const dropoffValid =
        d &&
        d.isAfter(pickupBase, "day") &&
        d.diff(pickupBase, "day") >= slaDays &&
        allowedWeekdays.includes(d.day());

      if (!dropoffValid && d) {
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

  // Enforce dropoff validity whenever pickup/dropoff change under a selected route
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

    if (!dropoffValid) {
      for (let j = Math.max(1, slaDays); j <= 42; j++) {
        const candidate = p.add(j, "day");
        if (isWeekdayAllowed(candidate)) {
          setValue("dropoffDate", toLocalNoon(candidate), {
            shouldDirty: true,
          });
          dropOffTouchedRef.current = false;
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickupDate,
    dropoffDate,
    selectedRoute,
    slaDays,
    allowedWeekdays.join(","),
  ]);

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
    dropOffTouchedRef.current = false;
  }

  function onPickupChange(date: Date | undefined) {
    if (!date) return;
    if (dropOffTouchedRef.current && isValidDropoff(dropoffDate, date)) {
      return;
    }
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
