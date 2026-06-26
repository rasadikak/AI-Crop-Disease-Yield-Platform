import {Router} from "express";
import authMiddleware, {AuthRequest} from "../middleware/auth";

const profileRouter= Router();




profileRouter.post("/", authMiddleware,async()=>{

});

export default profileRouter;