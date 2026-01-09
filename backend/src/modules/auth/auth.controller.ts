import { success } from "../../lib/responses";
import authService from "./auth.service";
import otpService from "./otp.service";
import { controllerHandler } from "../../utils/controllerHandler";
import { OtpResponse, OtpVerification, PasswordLogin } from "./auth.types";
import { AuthTokensResponse, ApiResponse } from "magnoli-types";

class AuthController {
  refresh = controllerHandler<
    { body: { refreshToken: string } },
    ApiResponse<AuthTokensResponse>
  >(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.status(200).json(success(tokens, "Tokens refreshed successfully"));
  });

  signOut = controllerHandler<
    { body: { refreshToken: string } },
    ApiResponse<{ signedOut: boolean }>
  >(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.signOut(refreshToken);
    res.status(200).json(success(result, "Signed out successfully"));
  });

  otpSend = controllerHandler<{ body: { to: string } }, ApiResponse<OtpResponse>>(
    async (req, res) => {
      const { to } = req.body;
      const data = await otpService.send({ to });
      res.status(200).json(success(data, "OTP sent successfully"));
    }
  );

  otpCheck = controllerHandler<{ body: OtpVerification }, ApiResponse<AuthTokensResponse>>(
    async (req, res) => {
      const { to, code } = req.body;
      const result = await otpService.check({
        to,
        code,
      });
      res.status(200).json(success(result, "OTP verified successfully"));
    }
  );

  passwordLogin = controllerHandler<
    { body: PasswordLogin },
    ApiResponse<AuthTokensResponse>
  >(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginWithPassword(email, password);
    res.status(200).json(success(result, "Login successful"));
  });
}

const authController = new AuthController();

export default authController;
