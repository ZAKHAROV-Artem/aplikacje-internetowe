import { Request, Response, NextFunction } from "express";

function cors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  const isAllowedDynamicOrigin = (o: string): boolean => {
    try {
      const url = new URL(o);
      const hostname = url.hostname;
      if (hostname === "localhost") return true;
      if (hostname === "drycleaning.delivery") return true;
      if (hostname.endsWith(".drycleaning.delivery")) return true;
      return false;
    } catch {
      return false;
    }
  };

  // Optional: still allow explicit entries via env, in case we need to extend beyond the dynamic rule
  const explicitAllowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) || [];

  // Inform caches that the response varies by Origin
  res.header("Vary", "Origin");

  if (origin && (isAllowedDynamicOrigin(origin) || explicitAllowedOrigins.includes(origin))) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
}

export { cors };
