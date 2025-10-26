// Key functionality: 6-digit verification code entry; accepts any 6-digit numeric string.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { setTokens } from "@/modules/auth/auth.slice";
import { useDispatch, useSelector, type RootState } from "@/store";
import { Button } from "@/components/ui/button";
import ErrorBanner from "@/components/error-banner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useCheckVerifyMutation,
  useSendVerifyMutation,
} from "@/modules/auth/auth.api";
import { motion } from "motion/react";

type ApiError = { data?: { message?: string }; message?: string };

export default function CodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(30);
  const loginTo = useSelector((s: RootState) => s.auth.loginTo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkVerify, { isLoading: isChecking }] = useCheckVerifyMutation();
  const [sendVerify, { isLoading: isSending }] = useSendVerifyMutation();

  const canSubmit = useMemo(() => /^\d{6}$/.test(code), [code]);

  useEffect(() => {
    if (!loginTo) return;
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds, loginTo]);

  useEffect(() => {
    // Auto-submit when complete
    if (canSubmit) void onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit]);

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!loginTo) {
      setError("Missing login info. Please go back and try again.");
      return;
    }

    if (!canSubmit) {
      setError("Enter a 6-digit code");
      return;
    }
    try {
      const response = await checkVerify({
        to: loginTo,
        code,
      }).unwrap();
      // Response is now ApiResponse<CheckVerifyResponse>
      const result = response.data;
      dispatch(
        setTokens({
          accessToken: result?.accessToken || "",
          refreshToken: result?.refreshToken || "",
        })
      );
      navigate("/new");
    } catch (err) {
      const e = err as ApiError;
      const msg = e?.data?.message || e?.message || "Could not verify code";
      setError(msg);
    }
  }

  async function onResend() {
    if (!loginTo) return;
    try {
      setCode("");
      setError(null);
      await sendVerify({
        to: loginTo,
      }).unwrap();
      setResendSeconds(30);
    } catch (err) {
      const e = err as ApiError;
      const msg = e?.data?.message || e?.message || "Could not resend code";
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
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Enter verification code
            </h2>
            <p className="text-muted-foreground text-base">
              6 digits, numbers only
            </p>
          </div>

          <div>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(val) => {
                const digitsOnly = val.replace(/\D/g, "");
                setCode(digitsOnly);
              }}
              containerClassName="justify-center"
              className="mx-auto"
              aria-label="6-digit verification code"
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="text-sm text-muted-foreground text-center mt-3">
              Your code may take up to a minute to arrive.
            </div>
          </div>

          <ErrorBanner error={error} />

          <div className="grid gap-3">
            <Button type="submit" disabled={!canSubmit || isChecking} size="lg">
              {isChecking ? "Verifying…" : "Verify & continue"}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={onResend}
              disabled={resendSeconds > 0 || isSending}
            >
              {resendSeconds > 0
                ? `Resend code in ${resendSeconds}s`
                : isSending
                ? "Sending…"
                : "Resend code"}
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              Wrong email?{" "}
              <button
                type="button"
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                onClick={() => navigate("/auth/phone")}
              >
                Go back
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
