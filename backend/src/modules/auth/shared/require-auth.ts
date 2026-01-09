import { passport } from "../jwt.strategy";

const requireAuth = passport.authenticate("jwt", { session: false });
const hqJWT = passport.authenticate(`hq`, {
  failWithError: true,
  session: false,
});

const serviceJWT = passport.authenticate("service", {
  failWithError: true,
  session: false,
});

const requireAdminJWT = passport.authenticate("jwtAdmin", {
  failWithError: true,
  session: false,
});

const requireManagerJWT = passport.authenticate("jwtManager", {
  failWithError: true,
  session: false,
});

export { requireAuth, hqJWT, serviceJWT, requireAdminJWT, requireManagerJWT };
