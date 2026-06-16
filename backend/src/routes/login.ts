import { Request, Response, Router } from "express";
import { verifyPassword } from "../utils/password";
import { createToken } from "../middleware/auth";
import prisma from "../models/prisma";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const farmer = await prisma.farmer.findUnique({ where: { email } });

    if (!farmer) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const passwordMatch = await verifyPassword(password, farmer.password);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = await createToken(farmer.id);

    res.json({
      token,
      farmer: {
        id: farmer.id,
        name: farmer.name,
        email: farmer.email,
        district: farmer.district
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;