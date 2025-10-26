import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Runs the given guards one after another.
 * – If *any* guard calls next(err) ⇒ stop immediately and propagate that error.
 * – If every guard calls next() with no error ⇒ access is granted.
 */
function AND(...guards: RequestHandler[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // No guards?  Nothing to check.
    if (guards.length === 0) return next();

    let i = 0;

    const run = (err?: any) => {
      // ❌ a guard failed → propagate error right away
      if (err !== undefined) {
        return next(err);
      }

      // ✅ last guard just succeeded → grant access
      if (++i >= guards.length) {
        return next();
      }

      // 👉🏼 run the next guard
      guards[i](req, res, run);
    };

    // kick things off with the first guard
    guards[0](req, res, run);
  };
}

/**
 * Runs the given guards one after another.
 * – If a guard calls next() with no error ⇒ access is granted.
 * – If it calls next(err) ⇒ try the next guard.
 * – If all guards fail ⇒ forward the last error.
 */
function OR(...guards: RequestHandler[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    let i = 0;

    const run = (err?: any) => {
      // ✅ a guard succeeded → continue to route handler
      if (err === undefined) {
        return next();
      }

      // ❌ no more guards → propagate *last* error
      if (i >= guards.length) {
        return next(err);
      }

      // 👉🏼 try the next guard
      guards[i++](req, res, run);
    };

    // kick things off
    guards[i++](req, res, run);
  };
}

export { AND, OR };
