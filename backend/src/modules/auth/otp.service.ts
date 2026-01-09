import { createError } from "@/lib/responses";
import { prisma } from "../../lib/prisma";
import authService from "./auth.service";
import emailService from "../../lib/email/email.service";
import { OtpRequest, OtpVerification, OtpResponse } from "./auth.types";

class OtpService {
  private readonly OTP_EXPIRATION_MINUTES = 15;

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async send({ to: email }: OtpRequest): Promise<OtpResponse> {
    const code = this.generateOtpCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES);

    await prisma.emailOtp.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    await emailService.sendOtpEmail(email, code);

    return { sent: true };
  }

  async check({ to: email, code }: OtpVerification): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        email,
        code,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      throw createError.UnprocessableEntity(
        "Verification code is invalid or expired",
        {
          code: "INVALID_CODE",
        }
      );
    }

    if (otpRecord.attempts >= 5) {
      throw createError.UnprocessableEntity("Too many failed attempts", {
        code: "MAX_ATTEMPTS",
      });
    }

    await prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: email.split("@")[0],
          lastName: "",
          role: "USER",
        },
      });
    }

    const { accessToken, refreshToken } = await authService.issueTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

const otpService = new OtpService();

export default otpService;
