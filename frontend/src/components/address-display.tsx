import { MapPin, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CustomerLocation } from "@/modules/customers/customers.api";

interface AddressDisplayProps {
  location?: CustomerLocation | null;
  onEdit: () => void;
  className?: string;
}

export function AddressDisplay({
  location,
  onEdit,
  className,
}: AddressDisplayProps) {
  if (!location) {
    return (
      <Card className={`p-3 border-dashed ${className || ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                No delivery address set
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit3 className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>
      </Card>
    );
  }

  const fullAddress = [
    location.address1,
    location.city,
    location.state && location.zip
      ? `${location.state} ${location.zip}`
      : location.state || location.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className={`p-3 shadow-none rounded-md ${className || ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <MapPin className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Delivery Address
            </p>
            <p className="text-sm leading-relaxed">{fullAddress}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="ml-2 shrink-0"
        >
          <Edit3 className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
    </Card>
  );
}
