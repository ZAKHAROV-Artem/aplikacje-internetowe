import jwt from "jsonwebtoken";
import { JWTPayload } from "./auth.types";
import { AuthTokensResponse } from "magnoli-types";
import { InvalidTokenError } from "../../lib/http";

interface TokenUser {
  id: string;
  email: string;
  role: string;
  companyId?: string;
}

class AuthService {
  private readonly JWT_EXPIRES_IN = "15m";
  private readonly REFRESH_TOKEN_EXPIRES_IN = "2d";

  private createPayload(user: TokenUser, tokenType?: string): JWTPayload {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      appType: "university",
    };

    if (tokenType) {
      payload.tokenType = tokenType;
    }

    return payload;
  }

  signAccessToken(user: TokenUser): string {
    const payload = this.createPayload(user);
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  signRefreshToken(user: TokenUser): string {
    const payload = this.createPayload(user, "refresh");
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  async issueTokens(user: TokenUser): Promise<AuthTokensResponse> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    let payload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      );
    } catch (_) {
      throw new InvalidTokenError("Invalid refresh token", {
        code: "INVALID_REFRESH",
      });
    }
    if (!payload || (payload as JWTPayload).tokenType !== "refresh") {
      throw new InvalidTokenError("Invalid refresh token payload", {
        code: "INVALID_REFRESH",
      });
    }
    const jwtPayload = payload as JWTPayload;
    const user: TokenUser = {
      id: jwtPayload.sub,
      email: jwtPayload.email,
      role: jwtPayload.role,
      companyId: jwtPayload.companyId,
    };
    const tokens = await this.issueTokens(user);
    return tokens;
  }

  async signOut(refreshToken: string): Promise<{ signedOut: boolean }> {
    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch (_) {}
    return { signedOut: true };
  }
}

const authService = new AuthService();

export default authService;
