import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { ForbiddenError } from "../../lib/http";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET || "fallback-secret",
  ignoreExpiration: false,
};
const serviceOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SERVICE_AUTH_SECRET || "fallback-secret",
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
  "hq",
  new JwtStrategy(options, async (jwtPayload: any, done: any) => {
    try {
      if (jwtPayload.appType !== "hq") {
        return done(new ForbiddenError("HQ access required"), false);
      }
      return done(null, jwtPayload);
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.use(
  "service",
  new JwtStrategy(serviceOptions, async (jwtPayload: any, done: any) => {
    try {
      return done(null, jwtPayload);
    } catch (error) {
      return done(error, false);
    }
  })
);

export { passport };
