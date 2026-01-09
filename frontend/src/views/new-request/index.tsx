import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { useCreatePickupRequestMutation } from "@/modules/pickup-requests/pickup-requests.api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import ErrorBanner from "@/components/error-banner";
import { useGetMeQuery } from "@/modules/customers/customers.api";
import type { ApiCustomerLocation } from "@/modules/customers/customers.api";
import { motion } from "motion/react";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddressDisplay } from "@/components/address-display";
// Removed inline address edit modal in favor of navigating to onboarding page
import { DatePicker } from "@/components/ui/date-picker";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouteDates } from "@/hooks/use-route-dates";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pickupRequestCreateInputSchema,
  type PickupRequestCreateInput,
  dateToBusinessDate,
  fromBusinessDateToDate,
} from "magnoli-types";

export default function NewRequestPage() {
  const [createPickupRequest, { isLoading: isCreating }] =
    useCreatePickupRequestMutation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation() as {
    state?: { restoreForm?: Partial<PickupRequestCreateInput> };
  };
  const { data: meResponse } = useGetMeQuery();
  const me = meResponse?.data;
  const defaultOrFirstLocation: ApiCustomerLocation | undefined = (() => {
    const list = me?.customerLocations;
    if (!Array.isArray(list) || list.length === 0) return undefined;
    return list.find((l) => l.alias === "default") ?? list[0];
  })();
  const firstName = me?.firstName || "";

  const form = useForm<PickupRequestCreateInput>({
    resolver: zodResolver(pickupRequestCreateInputSchema),
    defaultValues: {
      customerId: me?.id || "",
      addressId: defaultOrFirstLocation?.id || "",
      routeId: "",
      magnoliCustomerId: "",
      pickupDate: undefined,
      dropoffDate: undefined,
      metadata: {
        notes: "",
        pickupPartOfDay: "AM",
        dropoffPartOfDay: "PM",
      },
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;

  // Restore form values if coming back from onboarding
  useEffect(() => {
    if (location.state?.restoreForm) {
      form.reset({ ...form.getValues(), ...location.state.restoreForm });
    }
  }, [location.state, form]);

  // Update form values when user data changes
  useEffect(() => {
    if (defaultOrFirstLocation?.id) {
      setValue("addressId", defaultOrFirstLocation.id);
    }
    if (me?.id) {
      setValue("customerId", me.id);
    }
  }, [defaultOrFirstLocation?.id, me?.id, setValue]);

  const routeId = watch("routeId");
  const pickupDateStr = watch("pickupDate") as string | undefined | null;
  const dropoffDateStr = watch("dropoffDate") as string | undefined | null;
  const pickupDate = pickupDateStr
    ? (fromBusinessDateToDate(pickupDateStr) as Date)
    : undefined;
  const dropoffDate = dropoffDateStr
    ? (fromBusinessDateToDate(dropoffDateStr) as Date)
    : undefined;
  const pickupPartOfDay = watch("metadata.pickupPartOfDay");
  const dropoffPartOfDay = watch("metadata.dropoffPartOfDay");

  // Note: New API doesn't provide location data, so address is never complete from customer profile
  const addressComplete = Boolean(
    defaultOrFirstLocation?.address1 &&
      defaultOrFirstLocation?.city &&
      defaultOrFirstLocation?.state &&
      defaultOrFirstLocation?.zip
  );

  // Load routes by zip and enable route-based scheduling when available
  const {
    routes,
    hasRoutes,
    pickupDisabledDays: routePickupDisabledDays,
    dropOffDisabledDays: routeDropOffDisabledDays,
    onRouteChange,
    onPickupChange: onRoutePickupChange,
    onDropoffChange: onRouteDropoffChange,
  } = useRouteDates({
    zipCode: String(defaultOrFirstLocation?.zip || ""),
    addressComplete: Boolean(addressComplete),
    routeId: routeId || undefined,
    pickupDate,
    dropoffDate,
    setValue: ((name, value, options) => {
      if (name === "pickupDate" || name === "dropoffDate") {
        const next =
          value instanceof Date
            ? (dateToBusinessDate(value) as unknown)
            : (value as unknown);
        setValue(name as never, next as never, options);
      } else {
        setValue(name as never, value as never, options);
      }
    }) as (
      name: "routeId" | "pickupDate" | "dropoffDate",
      value: unknown,
      options?: {
        shouldDirty?: boolean;
        shouldTouch?: boolean;
        shouldValidate?: boolean;
      }
    ) => void,
  });

  const onValidSubmit: SubmitHandler<PickupRequestCreateInput> = async (
    values
  ) => {
    try {
      const response = await createPickupRequest(values).unwrap();

      // Response structure: { status: 'success', data: { id: '...', ...pickupRequest } }
      const pickupRequestId = response.data?.id;

      if (pickupRequestId) {
        navigate(`/success/${pickupRequestId}`);
      } else {
        navigate("/orders");
      }
    } catch (error) {
      // Error handling is done by ErrorBanner component
      console.error("Failed to create pickup request:", error);
    }
  };

  return (
    <motion.div
      className="min-h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-full flex flex-col justify-center py-4">
        <div className="w-full max-w-2xl mx-auto  pb-2 ">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl text-center sm:text-2xl font-semibold">
              Schedule pickup{firstName ? `, ${firstName}` : ""}
            </h1>
          </div>

          {/* Address Display Section */}
          <div className="mb-4 sm:mb-6">
            <AddressDisplay
              location={
                defaultOrFirstLocation && addressComplete
                  ? defaultOrFirstLocation
                  : null
              }
              onEdit={() => {
                navigate("/onboarding", {
                  state: {
                    from: "/new",
                    formValues: form.getValues(),
                    initialValues: {
                      firstName: me?.firstName || "",
                      lastName: me?.lastName || "",
                      street: defaultOrFirstLocation?.address1 || "",
                      city: defaultOrFirstLocation?.city || "",
                      stateVal: defaultOrFirstLocation?.state || "",
                      zip: defaultOrFirstLocation?.zip || "",
                    },
                  },
                });
              }}
            />
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit(onValidSubmit)}>
              {addressComplete && (
                <div className="space-y-4">
                  {hasRoutes ? (
                    <div className="space-y-4">
                      {/* Show route selector when multiple routes exist */}
                      {routes.length > 1 && (
                        <div className="grid grid-cols-4 gap-5 w-full">
                          <FormField
                            control={control}
                            name="routeId"
                            render={({ field }) => (
                              <FormItem className="col-span-4">
                                <FormLabel>Route <span className="text-muted-foreground text-sm font-normal">(required)</span></FormLabel>
                                <Select
                                  value={(field.value as string) ?? ""}
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    onRouteChange();
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      size={isMobile ? "sm" : "default"}
                                      className="w-full"
                                    >
                                      <SelectValue placeholder="Choose route" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {routes.map((r) => {
                                      const cruiseTime = r.pricelist?.slaDays 
                                        ? `${r.pricelist.slaDays} day${r.pricelist.slaDays !== 1 ? 's' : ''} cruise`
                                        : `${r.startTime} - ${r.endTime}`;
                                      return (
                                        <SelectItem key={r.id} value={r.id}>
                                          {r.name} ({cruiseTime})
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-5 w-full">
                        <div className=" col-span-4 space-y-2 sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <FormLabel>Pickup Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center"
                                >
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3 text-sm">
                                <div>
                                  <div className="font-medium mb-1">
                                    Time Windows:
                                  </div>
                                  <div>AM: 8:00 AM - 2:00 PM</div>
                                  <div>PM: 2:00 PM - 8:00 PM</div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormField
                            control={control}
                            name="pickupDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <DatePicker
                                    value={pickupDate}
                                    className="max-w-none w-full"
                                    onChange={(d) => {
                                      const next = d
                                        ? dateToBusinessDate(d)
                                        : undefined;
                                      field.onChange(next);
                                      onRoutePickupChange(d);
                                    }}
                                    size={isMobile ? "sm" : "lg"}
                                    disabledDays={routePickupDisabledDays}
                                    disableDate={routes.length > 1 && !routeId}
                                    withPartOfDay
                                    partOfDay={
                                      pickupPartOfDay as "AM" | "PM" | undefined
                                    }
                                    onPartOfDayChange={(v) =>
                                      setValue(
                                        "metadata.pickupPartOfDay",
                                        v as never,
                                        {
                                          shouldDirty: true,
                                        }
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-4 space-y-2 sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <FormLabel>Drop-off Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center"
                                >
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3 text-sm">
                                <div>
                                  <div className="font-medium mb-1">
                                    Time Windows:
                                  </div>
                                  <div>AM: 8:00 AM - 2:00 PM</div>
                                  <div>PM: 2:00 PM - 8:00 PM</div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormField
                            control={control}
                            name="dropoffDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <DatePicker
                                    value={field.value}
                                    className="max-w-none w-full"
                                    onChange={(d) => {
                                      const next = d
                                        ? dateToBusinessDate(d)
                                        : undefined;
                                      field.onChange(next);
                                      onRouteDropoffChange(d);
                                    }}
                                    size={isMobile ? "sm" : "lg"}
                                    disabledDays={routeDropOffDisabledDays}
                                    disableDate={routes.length > 1 && !routeId}
                                    withPartOfDay
                                    partOfDay={
                                      dropoffPartOfDay as
                                        | "AM"
                                        | "PM"
                                        | undefined
                                    }
                                    onPartOfDayChange={(v) =>
                                      setValue(
                                        "metadata.dropoffPartOfDay",
                                        v as never,
                                        {
                                          shouldDirty: true,
                                        }
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-4 space-y-2">
                          <FormLabel>
                            Special Instructions
                            <span className="text-sm font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormField
                            control={control}
                            name="metadata.notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any special instructions for pickup or delivery? (e.g., gate code, specific items, etc.)"
                                    rows={4}
                                    value={field.value as unknown as string}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-5 w-full">
                        <div className="space-y-2 col-span-4 sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <FormLabel>Pickup Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center"
                                >
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3 text-sm">
                                <div>
                                  <div className="font-medium mb-1">
                                    Time Windows:
                                  </div>
                                  <div>AM: 8:00 AM - 2:00 PM</div>
                                  <div>PM: 2:00 PM - 8:00 PM</div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormField
                            control={control}
                            name="pickupDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <DatePicker
                                    value={field.value}
                                    className="max-w-none w-full"
                                    onChange={(d) => {
                                      const next = d
                                        ? dateToBusinessDate(d)
                                        : undefined;
                                      field.onChange(next);
                                      onRoutePickupChange(d);
                                    }}
                                    disabledDays={routePickupDisabledDays}
                                    withPartOfDay
                                    partOfDay={
                                      pickupPartOfDay as "AM" | "PM" | undefined
                                    }
                                    onPartOfDayChange={(v) =>
                                      setValue(
                                        "metadata.pickupPartOfDay",
                                        v as never,
                                        {
                                          shouldDirty: true,
                                        }
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-2 col-span-4 sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <FormLabel>Drop-off Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center"
                                >
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3 text-sm">
                                <div>
                                  <div className="font-medium mb-1">
                                    Time Windows:
                                  </div>
                                  <div>AM: 8:00 AM - 2:00 PM</div>
                                  <div>PM: 2:00 PM - 8:00 PM</div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormField
                            control={control}
                            name="dropoffDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <DatePicker
                                    value={field.value}
                                    className="max-w-none w-full"
                                    onChange={(d) => {
                                      const next = d
                                        ? dateToBusinessDate(d)
                                        : undefined;
                                      field.onChange(next);
                                      onRouteDropoffChange(d);
                                    }}
                                    disabledDays={routeDropOffDisabledDays}
                                    withPartOfDay
                                    partOfDay={
                                      dropoffPartOfDay as
                                        | "AM"
                                        | "PM"
                                        | undefined
                                    }
                                    onPartOfDayChange={(v) =>
                                      setValue(
                                        "metadata.dropoffPartOfDay",
                                        v as never,
                                        {
                                          shouldDirty: true,
                                        }
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-4 space-y-2">
                          <FormLabel>
                            Special Instructions
                            <span className="font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormField
                            control={control}
                            name="metadata.notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any special instructions for pickup or delivery? (e.g., gate code, specific items, etc.)"
                                    rows={4}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(() => {
                const collectErrors = (errs: unknown): string[] => {
                  const messages: string[] = [];
                  const visit = (obj: unknown) => {
                    if (!obj || typeof obj !== "object") return;
                    const maybe: Record<string, unknown> = obj as Record<
                      string,
                      unknown
                    >;
                    if (typeof maybe.message === "string") {
                      messages.push(maybe.message);
                    }
                    for (const val of Object.values(maybe)) {
                      if (val && typeof val === "object") visit(val);
                    }
                  };
                  visit(errs);
                  return Array.from(new Set(messages)).filter(Boolean);
                };
                const zodErrors = collectErrors(form.formState.errors);
                const errorText = zodErrors.join(". ");
                return (
                  <ErrorBanner error={errorText || null} className="mt-1" />
                );
              })()}

              {/* Submit Button */}
              {addressComplete && (
                <div className="flex justify-end">
                  <Button
                    className="w-full "
                    disabled={isSubmitting || isCreating}
                    type="submit"
                  >
                    {isSubmitting || isCreating
                      ? "Submitting..."
                      : "Submit Request"}
                  </Button>
                </div>
              )}
            </form>
          </Form>

          {/* Address Edit Modal */}
          {/* Removed AddressEditModal usage */}
        </div>
      </div>
    </motion.div>
  );
}
