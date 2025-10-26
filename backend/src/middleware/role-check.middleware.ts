import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../lib/http";

type UserRole = "ADMIN" | "COMPANY_MANAGER" | "USER";

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      throw new ForbiddenError("Authentication required");
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};

export const requireAdmin = requireRole(["ADMIN"]);

export const requireManagerOrAdmin = requireRole(["ADMIN", "COMPANY_MANAGER"]);

export const requireCompanyAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  const companyId = req.params.companyId || (req.body as any).companyId;

  if (!user) {
    throw new ForbiddenError("Authentication required");
  }

  if (user.role === "ADMIN") {
    return next();
  }

  if (user.role === "COMPANY_MANAGER" && user.companyId === companyId) {
    return next();
  }

  throw new ForbiddenError("Access denied to this company");
};
