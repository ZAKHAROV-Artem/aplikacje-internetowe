import { useFormContext } from "react-hook-form";
import { useEffect, useRef } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface NameStepProps {
  shouldAutofocus?: boolean;
}

export default function NameStep({ shouldAutofocus = true }: NameStepProps) {
  const form = useFormContext();
  const firstNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the first name field after a short delay to ensure animations are complete
    // Only autofocus if shouldAutofocus is true
    if (shouldAutofocus) {
      const timer = setTimeout(() => {
        if (firstNameRef.current) {
          firstNameRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [shouldAutofocus]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    firstNameRef.current = e;
                  }}
                  placeholder="John"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
