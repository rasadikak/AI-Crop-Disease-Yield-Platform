import { Request, Response, Router } from "express";
import authMiddleware, { AuthRequest } from "../middleware/auth";

const router = Router();


router.route("/")
  .get(authMiddleware, (req: AuthRequest, res: Response) => {
    try {
      console.log(`Farmer signing out — id:${req.farmerId}`);

      // JWT is stateless — no cookie to delete server side
      // frontend will delete the token from its storage
     
      res.json({ message: "Logged out successfully" });

    } catch (error) {
      console.error(`Signout failed — error:${error}`);
      res.status(500).json({ error: "Signout failed" });
    }
  })
  .post(authMiddleware, (req: AuthRequest, res: Response) => {
    try {
      console.log(`Farmer signing out — id:${req.farmerId}`);
      res.json({ message: "Logged out successfully" });

    } catch (error) {
      console.error(`Signout failed — error:${error}`);
      res.status(500).json({ error: "Signout failed" });
    }
  });

export default router;