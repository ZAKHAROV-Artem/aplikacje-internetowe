import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StateSelect } from "@/components/ui/state-select";

export default function AddressStep() {
  const form = useFormContext();

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Home address</FormLabel>
            <FormControl>
              <Input autoFocus placeholder="123 Main Street" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-6 gap-y-5 gap-x-3">
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Las Vegas" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-3">
          <FormField
            control={form.control}
            name="stateVal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <StateSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                    placeholder="Select a state"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-3">
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP</FormLabel>
                <FormControl>
                  <Input placeholder="94102" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
