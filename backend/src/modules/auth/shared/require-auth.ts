import { passport  } from "../jwt.strategy";

const requireAuth = passport.authenticate("jwt", { session: false });
const hqJWT = passport.authenticate(`hq`, {
  failWithError: true,
  session: false,
});

const posJWT = passport.authenticate("pos", {
  failWithError: true,
  session: false,
});

const serviceJWT = passport.authenticate("service", {
  failWithError: true,
  session: false,
});
export { requireAuth, hqJWT, posJWT, serviceJWT  };
