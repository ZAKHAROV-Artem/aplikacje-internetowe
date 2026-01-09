// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  companyId?: string;
  appType: string;
  tokenType?: string;
  iat?: number;
  exp?: number;
}

export interface OtpRequest {
  to: string;
}

export interface OtpVerification {
  to: string;
  code: string;
}

export interface OtpResponse {
  sent: boolean;
}

export interface OtpEmailRequest {
  to: string;
  magnoliCustomerId: string;
  code: string;
}

export interface PasswordLogin {
  email: string;
  password: string;
}