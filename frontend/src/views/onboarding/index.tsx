import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemas, type OnboardingFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Form } from "@/components/ui/form";
import ErrorBanner from "@/components/error-banner";
import NameStep from "./components/name-step";
import AddressStep from "./components/address-step";
import {
  useUpdateMeMutation,
  useGetMeQuery,
} from "@/modules/customers/customers.api";
import { toast } from "sonner";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: {
      from?: string;
      initialValues?: Partial<OnboardingFormValues>;
      formValues?: Record<string, unknown>;
    };
  };
  const [updateMe] = useUpdateMeMutation();
  const { data: meResponse } = useGetMeQuery();
  const me = meResponse?.data;

  const [isLoading, setIsLoading] = useState(false);

  const isUpdating = Boolean(location.state?.from);

  const defaultVals = useMemo<OnboardingFormValues>(() => {
    return {
      firstName:
        location.state?.initialValues?.firstName || me?.firstName || "",
      lastName: location.state?.initialValues?.lastName || me?.lastName || "",
      street: location.state?.initialValues?.street || "",
      city: location.state?.initialValues?.city || "",
      stateVal: location.state?.initialValues?.stateVal || "",
      zip: location.state?.initialValues?.zip || "",
    };
  }, [location.state, me?.firstName, me?.lastName]);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(schemas.onboarding),
    mode: "onSubmit",
    defaultValues: defaultVals,
  });

  async function onSubmit(values: OnboardingFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        location: {
          name: "Home",
          address: values.street.trim(),
          city: values.city.trim(),
          state: values.stateVal.trim(),
          zip: values.zip.trim(),
        },
      };
      await updateMe(payload).unwrap();
      // Show success toast only when updating info
      if (location.state?.from) {
        toast.success("Your information has been updated successfully!");
      }

      if (location.state?.from) {
        navigate(location.state.from, {
          state: { restoreForm: location.state?.formValues },
        });
      } else {
        navigate("/new");
      }
    } catch {
      // do nothing
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      className="min-h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-full flex flex-col justify-center py-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl md:text-3xl font-bold mb-2 text-foreground">
              {isUpdating
                ? "Update your information"
                : "Tell us about yourself"}
            </h1>
          </div>

          <div className="w-full max-w-md md:max-w-lg mx-auto">
            <Form {...form}>
              <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <NameStep shouldAutofocus={!isUpdating} />
                <AddressStep />

                {(() => {
                  const collect = (errs: unknown): string[] => {
                    const out: string[] = [];
                    const visit = (o: unknown) => {
                      if (!o || typeof o !== "object") return;
                      const rec = o as Record<string, unknown>;
                      if (typeof rec.message === "string")
                        out.push(rec.message);
                      for (const v of Object.values(rec))
                        if (v && typeof v === "object") visit(v);
                    };
                    visit(errs);
                    return Array.from(new Set(out)).filter(Boolean);
                  };
                  const msgs = collect(form.formState.errors).join(". ");
                  return <ErrorBanner error={msgs || null} className="mt-1" />;
                })()}

                <div className="grid gap-3">
                  <Button type="submit" size="lg" disabled={isLoading}>
                    {isLoading
                      ? isUpdating
                        ? "Updating your information..."
                        : "Setting up your account..."
                      : isUpdating
                      ? "Update information"
                      : "Complete setup"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
