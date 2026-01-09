import { useNavigate, useParams } from "react-router";
import {
  useGetRouteQuery,
  useUpdateRouteMutation,
} from "@/modules/admin/routes.api";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TimePicker from "@/components/ui/time-picker/time-picker";
import { formatTimeToAmPmLong } from "@/lib/time-utils";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Helper function to convert time to minutes for comparison
// Handles both 24h format (HH:MM) and AM/PM format
const timeToMinutes = (timeStr: string): number => {
  // Check if it's 24h format
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // AM/PM format
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalHours = hours;
  if (period === "PM" && hours !== 12) totalHours += 12;
  if (period === "AM" && hours === 12) totalHours = 0;
  return totalHours * 60 + minutes;
};

const routeFormSchema = z
  .object({
    name: z.string().min(1, "Route name is required"),
    zipCodes: z.string().min(1, "At least one zip code is required"),
    weekdays: z.array(z.string()).min(1, "Select at least one weekday"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    active: z.boolean(),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      // Works with both 24h and AM/PM formats
      const startMins = timeToMinutes(data.startTime);
      const endMins = timeToMinutes(data.endTime);
      return endMins > startMins;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

type RouteFormValues = z.infer<typeof routeFormSchema>;

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function EditRoutePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetRouteQuery(id || "");
  const [updateRoute] = useUpdateRouteMutation();

  const route = data?.data;

  // Helper function to convert 24-hour format to AM/PM format
  const convert24To12 = (timeInput: string): string => {
    if (!timeInput) return "8:00 AM";

    // Handle already in AM/PM format
    if (timeInput.includes("AM") || timeInput.includes("PM")) {
      return timeInput;
    }

    // Parse 24-hour format (HH:MM)
    const parts = timeInput.split(":");
    if (parts.length !== 2) return "8:00 AM";

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return "8:00 AM";

    let hour12: number;
    let ampm: string;

    if (hours === 0) {
      hour12 = 12;
      ampm = "AM";
    } else if (hours === 12) {
      hour12 = 12;
      ampm = "PM";
    } else if (hours > 12) {
      hour12 = hours - 12;
      ampm = "PM";
    } else {
      hour12 = hours;
      ampm = "AM";
    }

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // Helper function to convert AM/PM format to 24-hour format for TimePicker
  const convert12To24 = (timeInput: string): string => {
    if (!timeInput) return "08:00";

    // If already in 24h format, return as is
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput)) {
      const [hours, minutes] = timeInput.split(":");
      return `${hours.padStart(2, "0")}:${minutes}`;
    }

    // Parse AM/PM format
    const ampmMatch = timeInput.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = ampmMatch[2];
      const period = ampmMatch[3].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    return "08:00";
  };

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      name: "",
      zipCodes: "",
      weekdays: [],
      startTime: "8:00 AM",
      endTime: "6:00 PM",
      active: true,
    },
  });

  useEffect(() => {
    if (route) {
      const startTime = convert24To12(route.startTime);
      const endTime = convert24To12(route.endTime);
      form.reset({
        name: route.name,
        zipCodes: route.zipCodes.join(", "),
        weekdays: route.weekdays,
        startTime: startTime,
        endTime: endTime,
        active: route.active,
      });
    }
  }, [route, form]);

  const onSubmit = async (values: RouteFormValues) => {
    if (!id) return;

    try {
      await updateRoute({
        id,
        data: {
          name: values.name,
          zipCodes: values.zipCodes.split(",").map((z) => z.trim()),
          weekdays: values.weekdays,
          startTime: values.startTime,
          endTime: values.endTime,
          active: values.active,
        },
      }).unwrap();
      toast.success("Route updated successfully");
      navigate("/admin/routes");
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(message || "Failed to update route");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!route) return <div>Route not found</div>;

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/routes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Route</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter route name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Codes *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="12345, 12346, 12347" />
                </FormControl>
                <FormDescription>
                  Separate multiple zip codes with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weekdays"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Operating Days *</FormLabel>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {WEEKDAYS.map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name="weekdays"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, day])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== day
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {day}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <TimePicker
                      date={convert12To24(field.value)}
                      onChange={(time24h) => {
                        // Convert 24h format from TimePicker to AM/PM format for form
                        const timeAmPm = formatTimeToAmPmLong(time24h);
                        field.onChange(timeAmPm);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time *</FormLabel>
                  <FormControl>
                    <TimePicker
                      date={convert12To24(field.value)}
                      onChange={(time24h) => {
                        // Convert 24h format from TimePicker to AM/PM format for form
                        const timeAmPm = formatTimeToAmPmLong(time24h);
                        field.onChange(timeAmPm);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Route is active</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating..." : "Update Route"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/routes")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
