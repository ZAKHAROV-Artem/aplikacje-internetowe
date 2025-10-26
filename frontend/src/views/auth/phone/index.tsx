// Key functionality: Email entry page for OTP auth, proceeds to verification code.
import { useState } from "react";
import { useNavigate } from "react-router";
import { setLoginTarget } from "@/modules/auth/auth.slice";
import ErrorBanner from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemas, type EmailAuthFormValues } from "@/lib/schemas";
import { motion } from "motion/react";
import { useSendVerifyMutation } from "@/modules/auth/auth.api";
import { useFirstVisit } from "@/hooks/use-first-visit";
import { Input } from "@/components/ui/input";
import { useDispatch } from "@/store";

export default function EmailPage() {
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sendVerify, { isLoading: isSending }] = useSendVerifyMutation();
  const isFirstVisit = useFirstVisit();

  // Email form
  const emailForm = useForm<EmailAuthFormValues>({
    resolver: zodResolver(schemas.emailAuth),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  async function onSubmitEmail(values: EmailAuthFormValues) {
    try {
      setError(null);
      dispatch(setLoginTarget({ to: values.email }));
      // Call backend to send verification code
      await sendVerify({
        to: values.email,
      }).unwrap();
      navigate("/auth/code");
    } catch (err) {
      const e = err as { data?: { message?: string }; message?: string };
      const msg = e?.data?.message || e?.message || "Could not send code";
      setError(msg);
    }
  }

  return (
    <motion.div
      className="flex items-center justify-center px-4 min-h-[calc(100dvh-140px)] md:min-h-[calc(100dvh-180px)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-md">
        <Form {...emailForm}>
          <form
            className="flex flex-col gap-2"
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
          >
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                {isFirstVisit ? "Welcome" : "Welcome back"}
              </h2>
              <p className="text-muted-foreground text-base">
                We'll send you a verification code via email
              </p>
            </div>
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {(() => {
              const collect = (errs: unknown): string[] => {
                const out: string[] = [];
                const visit = (o: unknown) => {
                  if (!o || typeof o !== "object") return;
                  const rec = o as Record<string, unknown>;
                  if (typeof rec.message === "string") out.push(rec.message);
                  for (const v of Object.values(rec))
                    if (v && typeof v === "object") visit(v);
                };
                visit(errs);
                return Array.from(new Set(out)).filter(Boolean);
              };
              const msgs = collect(emailForm.formState.errors).join(". ");
              const merged = [error, msgs].filter(Boolean).join(". ");
              return <ErrorBanner error={merged || null} />;
            })()}
            <Button type="submit" className="w-full" disabled={isSending}>
              {isSending ? "Sending…" : "Continue"}
            </Button>
          </form>
        </Form>

        <div className="text-muted-foreground text-center text-sm text-balance mt-4 px-4">
          By clicking continue, you agree to our{" "}
          <a
            href="#"
            className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </motion.div>
  );
}
