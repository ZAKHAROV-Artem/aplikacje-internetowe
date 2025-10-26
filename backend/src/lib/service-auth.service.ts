import jwt from "jsonwebtoken";
import { MissingConfigError } from "./http";

/**
 * ServiceAuthService
 *  - Generates a very short-lived JWT signed with SERVICE_AUTH_SECRET.
 *  - Token is intended for server-to-server communication when a user JWT is
 *    not available.
 */
class ServiceAuthService {
  /**
   * Optional caching: generate a token once per process every ~30s to avoid
   * CPU overhead under high concurrency. Not strictly required but nice.
   */
  private cachedToken: string | null = null;
  private cachedTokenExp: number = 0;
  private readonly EXPIRES_IN = "60s";
  private readonly SECRET: string;

  constructor() {
    this.SECRET = process.env.SERVICE_AUTH_SECRET || "";
  }

  /**
   * Returns a valid JWT. Caches until 30s before expiry to minimise needless
   * re-signing.
   */
  getToken(magnoliCustomerId?: string): string {
    if (!this.SECRET) {
      throw new MissingConfigError("SERVICE_AUTH_SECRET");
    }

    // If caller provides extra claims (e.g., magnoliCustomerId), skip global cache
    if (magnoliCustomerId) {
      const payload = {
        iss: "magnoli-hq",
        sub: "crm-backend",
        magnoliCustomerId,
      };
      return jwt.sign(payload, this.SECRET, { expiresIn: this.EXPIRES_IN });
    }

    const now = Math.floor(Date.now() / 1000);
    if (this.cachedToken && now < this.cachedTokenExp - 30) {
      return this.cachedToken;
    }

    const payload = {
      iss: "magnoli-hq",
      sub: "crm-backend",
      magnoliCustomerId,
    };

    const token = jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
    });

    // Decode to know exp
    const decoded = jwt.decode(token) as { exp?: number } | null;
    this.cachedToken = token;
    this.cachedTokenExp = decoded?.exp ?? now + 60;

    return token;
  }
}

const serviceAuthService = new ServiceAuthService();
export { serviceAuthService };
