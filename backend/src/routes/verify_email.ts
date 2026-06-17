import { Request, Response, Router } from "express";
import prisma from "../models/prisma";
import { sendEmail } from "../services/sendEmail";
import {  createVerifyEmailToken, verifyEmailToken } from "../middleware/auth";


const router = Router();

// email verification for login


router.post("/request_verify_link", async (req: Request, res: Response) => {
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












router.get("/verify", (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  const frontendUrl = process.env.FRONTEND_URL;

  console.log("verification link clicked — verifying token");

  try {
    
    const id=verifyEmailToken(token);

    const user= prisma.farmer.findUnique({where:{id:id}});

    if (!user){
        console.error(` user not found `);
        res.redirect(`${frontendUrl}/register?error=user_not_found`);
    }

    const is_verified= user.is_verified;
    if (is_verified== true){
        console.warn(`user is already verified`);
        res.redirect(`${frontendUrl}/login?msg=user_already_verified}`);


    }

    prisma.user.update({
        where:{id:id},
        data:{is_verified:true}
    });

    console.log(`email verified successfully — user:${id}`);
    res.json({ message: "email verified successfully" });
    res.redirect(`${frontendUrl}/login}`);




    
    

  } catch (error) {
    console.error(` verification failed — error:${error}`);
    res.redirect(`${frontendUrl}/request?error=link_expired`);
  }
});








