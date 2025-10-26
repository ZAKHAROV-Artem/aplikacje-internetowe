import { success } from "../../lib/http";
import authService from "./auth.service";
import otpService from "./otp.service";
import { controllerHandler2 } from "../../utils/controllerHandler2";
import { OtpResponse, OtpVerification } from "./auth.types";
import { AuthTokensResponse } from "magnoli-types";

class AuthController {
  refresh = controllerHandler2<
    { body: { refreshToken: string } },
    AuthTokensResponse
  >(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    success(res, tokens);
  });

  signOut = controllerHandler2<
    { body: { refreshToken: string } },
    { signedOut: boolean }
  >(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.signOut(refreshToken);
    success(res, result);
  });

  otpSend = controllerHandler2<{ body: { to: string } }, OtpResponse>(
    async (req, res) => {
      const { to } = req.body;
      const data = await otpService.send({ to });
      success(res, data);
    }
  );

  otpCheck = controllerHandler2<{ body: OtpVerification }, AuthTokensResponse>(
    async (req, res) => {
      const { to, code } = req.body;
      const result = await otpService.check({
        to,
        code,
      });
      success(res, result);
    }
  );
}

const authController = new AuthController();

export default authController;
