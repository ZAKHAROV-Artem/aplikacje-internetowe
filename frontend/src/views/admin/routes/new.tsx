import { useNavigate } from "react-router";
import { useCreateRouteMutation } from "@/modules/admin/routes.api";
import { useGetCompanyInfoQuery } from "@/modules/companies/companies.api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

  const [formData, setFormData] = useState({
    name: "",
    zipCodes: "",
    weekdays: ["Monday", "Wednesday", "Friday"],
    startTimeMins: 480,
    endTimeMins: 1080,
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRoute({
        companyId,
        name: formData.name,
        zipCodes: formData.zipCodes.split(",").map((z) => z.trim()),
        weekdays: formData.weekdays,
        startTimeMins: formData.startTimeMins,
        endTimeMins: formData.endTimeMins,
        active: formData.active,
      }).unwrap();
      toast.success("Route created successfully");
      navigate("/admin/routes");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create route");
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
            <Label htmlFor="startTimeMins">
              Start Time (minutes from midnight) *
            </Label>
            <Input
              id="startTimeMins"
              type="number"
              value={formData.startTimeMins}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startTimeMins: parseInt(e.target.value),
                })
              }
              required
            />
            <p className="text-xs text-muted-foreground mt-1">480 = 8:00 AM</p>
          </div>
          <div>
            <Label htmlFor="endTimeMins">
              End Time (minutes from midnight) *
            </Label>
            <Input
              id="endTimeMins"
              type="number"
              value={formData.endTimeMins}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endTimeMins: parseInt(e.target.value),
                })
              }
              required
            />
            <p className="text-xs text-muted-foreground mt-1">1080 = 6:00 PM</p>
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
