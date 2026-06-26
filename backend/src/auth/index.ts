import { Router } from "express";
import registerRouter       from "../routes/signup";
import loginRouter          from "../routes/login";
import logoutRouter         from "../routes/signout";
import forgotPasswordRouter from "../routes/password_reset";
import verifyEmailRouter    from "../routes/verify_email";
import profileRouter from "../routes/profile";

const authRouter = Router();

authRouter.use("/register",        registerRouter);
authRouter.use("/login",           loginRouter);
authRouter.use("/logout",          logoutRouter);
authRouter.use("/forgot-password", forgotPasswordRouter);
authRouter.use("/verify-email",    verifyEmailRouter);
authRouter.use("/profile", profileRouter);

export default authRouter;