import { NextFunction, Request, Response, Router } from "express";

import { getAppCheck } from "firebase-admin/app-check";

export const r = Router();

export const appCheckVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    console.log("No App Check token found!");
    res.status(401);
    return next("Unauthorized");
  }

  try {
    const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);
    console.log("App Check claims:", appCheckClaims);
    // If verifyToken() succeeds, continue with the next middleware
    // function in the stack.
    return next();
  } catch (err) {
    console.error("Error while verifying App Check token:", err);
    res.status(401);
    return next("Unauthorized");
  }
};

r.use(appCheckVerification);

r.get("/", (_req, res) => {
  res.json({
    msg: "If you're seeing this message, that means App Check verification passed on the token you provided!",
  });
});
export { r as apiRoutes };