import { useNavigate } from "react-router";
import { useCreateRouteMutation } from "@/modules/admin/routes.api";
import { useGetCompanyInfoQuery } from "@/modules/companies/companies.api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Helper function to convert AM/PM time to minutes for comparison
const timeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalHours = hours;
  if (period === "PM" && hours !== 12) totalHours += 12;
  if (period === "AM" && hours === 12) totalHours = 0;
  return totalHours * 60 + minutes;
};

// Generate time options in AM/PM format (12:00 AM to 11:59 PM)
const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour === 12 ? 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const timeValue = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
      const label = timeValue;
      options.push({ value: timeValue, label });
    }
  }
  return options;
};

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function NewRoutePage() {
  const navigate = useNavigate();
  const [createRoute] = useCreateRouteMutation();
  const { data: companyInfo } = useGetCompanyInfoQuery();
  const companyId = companyInfo?.data?.id || "";
  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const [formData, setFormData] = useState({
    name: "",
    zipCodes: "",
    weekdays: ["Monday", "Wednesday", "Friday"],
    startTime: "8:00 AM",
    endTime: "6:00 PM",
    active: true,
  });

  const [timeError, setTimeError] = useState<string>("");

  const validateTimesLocal = (startTime: string, endTime: string): boolean => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    if (endMins <= startMins) {
      setTimeError("End time must be after start time");
      return false;
    }
    setTimeError("");
    return true;
  };

  const handleStartTimeChange = (value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, startTime: value };
      validateTimesLocal(newData.startTime, newData.endTime);
      return newData;
    });
  };

  const handleEndTimeChange = (value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, endTime: value };
      validateTimesLocal(newData.startTime, newData.endTime);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTimesLocal(formData.startTime, formData.endTime)) {
      return;
    }

    try {
      await createRoute({
        companyId,
        name: formData.name,
        zipCodes: formData.zipCodes.split(",").map((z) => z.trim()),
        weekdays: formData.weekdays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        active: formData.active,
      }).unwrap();
      toast.success("Route created successfully");
      navigate("/admin/routes");
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(message || "Failed to create route");
    }
  };

  const toggleWeekday = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day],
    }));
  };

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
        <h1 className="text-3xl font-bold">Create New Route</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Route Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="zipCodes">Zip Codes *</Label>
          <Input
            id="zipCodes"
            value={formData.zipCodes}
            onChange={(e) =>
              setFormData({ ...formData, zipCodes: e.target.value })
            }
            placeholder="12345, 12346, 12347"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate multiple zip codes with commas
          </p>
        </div>

        <div>
          <Label>Operating Days *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={formData.weekdays.includes(day)}
                  onCheckedChange={() => toggleWeekday(day)}
                />
                <Label htmlFor={day} className="text-sm font-normal">
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time *</Label>
            <Select
              value={formData.startTime}
              onValueChange={handleStartTimeChange}
            >
              <SelectTrigger id="startTime" className="w-full">
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="endTime">End Time *</Label>
            <Select
              value={formData.endTime}
              onValueChange={handleEndTimeChange}
            >
              <SelectTrigger id="endTime" className="w-full">
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {timeError && (
              <p className="text-xs text-destructive mt-1">{timeError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, active: !!checked })
            }
          />
          <Label htmlFor="active">Route is active</Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Create Route
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
    </div>
  );
}
