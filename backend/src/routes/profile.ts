import {Router, Response} from "express";
import authMiddleware, {AuthRequest} from "../middleware/auth";

const profileRouter= Router();




profileRouter.post("/", authMiddleware,async(req:AuthRequest, res:Response)=>{

});

export default profileRouter;