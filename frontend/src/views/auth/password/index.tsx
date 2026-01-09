// Key functionality: Password login page for email and password authentication.
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { setTokens } from "@/modules/auth/auth.slice";
import ErrorBanner from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemas, type PasswordLoginFormValues } from "@/lib/schemas";
import { motion } from "motion/react";
import { usePasswordLoginMutation } from "@/modules/auth/auth.api";
import { Input } from "@/components/ui/input";
import { useDispatch } from "@/store";

export default function PasswordLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [passwordLogin, { isLoading: isPasswordLoggingIn }] =
    usePasswordLoginMutation();

  // Password login form
  const passwordForm = useForm<PasswordLoginFormValues>({
    resolver: zodResolver(schemas.passwordLogin),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  async function onSubmitPassword(values: PasswordLoginFormValues) {
    try {
      setError(null);
      const response = await passwordLogin({
        email: values.email,
        password: values.password,
      }).unwrap();
      // Response is ApiResponse<PasswordLoginResponse>
      const result = response.data;
      dispatch(
        setTokens({
          accessToken: result?.accessToken || "",
          refreshToken: result?.refreshToken || "",
        })
      );
      navigate("/new");
    } catch (err) {
      const e = err as { data?: { message?: string }; message?: string };
      const msg = e?.data?.message || e?.message || "Invalid email or password";
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
        <div className="flex flex-col items-center text-center space-y-2 mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Sign in with password
          </h2>
          <p className="text-muted-foreground text-base">
            Enter your email and password to continue
          </p>
        </div>

        <Form {...passwordForm}>
          <form
            className="flex flex-col gap-2"
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
          >
            <FormField
              control={passwordForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <ErrorBanner error={error} />}
            <Button
              type="submit"
              className="w-full"
              disabled={isPasswordLoggingIn}
            >
              {isPasswordLoggingIn ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted-foreground text-sm">
            Don't have a password?{" "}
            <Link
              to="/auth/email"
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
            >
              Sign in with email code
            </Link>
          </p>
        </div>

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
