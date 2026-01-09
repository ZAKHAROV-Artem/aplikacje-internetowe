import { createError } from "@/lib/responses";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET || "fallback-secret",
  ignoreExpiration: false,
};

passport.use(
  "jwt",
  new JwtStrategy(options, async (payload: any, done: any) => {
    try {
      if (!payload?.sub || !payload?.email || !payload?.role) {
        return done(null, false);
      }
      return done(null, payload);
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.use(
  "jwtAdmin",
  new JwtStrategy(options, async (jwtPayload: any, done: any) => {
    try {
      if (!jwtPayload?.sub || !jwtPayload?.email || !jwtPayload?.role) {
        return done(null, false);
      }
      if (jwtPayload.role !== "ADMIN") {
        return done(createError.Forbidden("Admin access required"), false);
      }
      return done(null, jwtPayload);
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.use(
  "jwtManager",
  new JwtStrategy(options, async (jwtPayload: any, done: any) => {
    try {
      if (!jwtPayload?.sub || !jwtPayload?.email || !jwtPayload?.role) {
        return done(null, false);
      }
      // Allow ADMIN and COMPANY_MANAGER roles
      if (
        jwtPayload.role !== "ADMIN" &&
        jwtPayload.role !== "COMPANY_MANAGER"
      ) {
        return done(
          createError.Forbidden("Admin or Manager access required"),
          false
        );
      }
      return done(null, jwtPayload);
    } catch (error) {
      return done(error, false);
    }
  })
);

export { passport };
