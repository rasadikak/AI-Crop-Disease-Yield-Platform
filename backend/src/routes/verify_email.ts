import { Request, Response, Router } from "express";
import prisma from "../models/prisma";
import { sendEmail } from "../services/sendEmail";
import { createVerifyEmailToken, verifyEmailToken } from "../middleware/auth";

const router = Router();

router.post("/request_verify_link", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const user = await prisma.farmer.findUnique({ where: { email } });

    if (!user) {
      console.warn(`Verification failed — farmer not found: ${email}`);
      res.status(400).json({ error: "No account found with this email" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Email already verified" });
      return;
    }

    const token = createVerifyEmailToken(user.id);
    await sendEmail(email, user.name, "verification", token);

    console.log(`Verification email sent — email:${email}`);
    res.json({ message: "Verification email sent to your mail" });

  } catch (error) {
    console.error(`Email verification request failed — email:${email} error:${error}`);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});











router.get("/verify", async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  const frontendUrl = process.env.FRONTEND_URL;

  try {
    const id = verifyEmailToken(token);

    const user = await prisma.farmer.findUnique({ where: { id } });

    if (!user) {
      console.error(`User not found — id:${id}`);
      res.redirect(`${frontendUrl}/register?error=user_not_found`);
      return;
    }

    if (user.isVerified) {
      console.warn(`User already verified — id:${id}`);
      res.redirect(`${frontendUrl}/login?msg=user_already_verified`);
      return;
    }

    await prisma.farmer.update({
      where: { id },
      data:  { isVerified: true }
    });

    console.log(`Email verified successfully — user:${id}`);
    res.redirect(`${frontendUrl}/login?success=email_verified`);

  } catch (error) {
    console.error(`Verification failed — error:${error}`);
    res.redirect(`${frontendUrl}/login?error=link_expired`);
  }
});

export default router;