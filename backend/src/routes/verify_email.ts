import { Request, Response, Router } from "express";
import prisma from "../models/prisma";
import { sendEmail } from "../services/sendEmail";
import {  createVerifyEmailToken, verifyEmailToken } from "../middleware/auth";
import { hashPassword } from "../utils/password";

const router = Router();

// email verification for login
router.post("/request", async (req: Request, res: Response) => {
  const { email } = req.body;  

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    
    const user = await prisma.farmer.findUnique({ where: { email } });

    
    if (!user) {
      console.warn(`Reset failed — farmer not found: ${email}`);
      res.status(400).json({ error: "No account found with this email" });
      return;
    }


    const token = createVerifyEmailToken(user.id);

    
    await sendEmail(email, user.name, "verification", token);

    console.log(`verification email sent — email:${email}`);
    res.json({ message: "verification email sent to your mail" });

  } catch (error) {
    console.error(`email verification request failed — email:${email} error:${error}`);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});







router.get("/reset-link", (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  const frontendUrl = process.env.FRONTEND_URL;

  console.log("verification link clicked — verifying token");

  try {
    
    verifyEmailToken(token);

    
    res.redirect(`${frontendUrl}/login?token=${token}`);

  } catch (error) {
    console.error(` verification failed — error:${error}`);
    res.redirect(`${frontendUrl}/request?error=link_expired`);
  }
});








router.post("/reset", async (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (newPassword !== confirmPassword) {
    console.warn("Password reset failed — passwords do not match");
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  try {
    
    const farmerId = verifyResetToken(token);

    const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });

    
    if (!farmer) {
      console.warn(`Password reset failed — farmer not found id:${farmerId}`);
      res.status(400).json({ error: "Farmer not found" });
      return;
    }

    
    const hashedPassword = await hashPassword(newPassword);

    
    await prisma.farmer.update({
      where: { id: farmerId },
      data:  { password: hashedPassword }
    });

    console.log(`Password updated successfully — farmer:${farmerId}`);
    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error(`Password reset failed — error:${error}`);
    res.status(500).json({ error: "Password reset failed" });
  }
});

export default router;