import {Router, Response} from "express";
import authMiddleware, {AuthRequest} from "../../middleware/auth";
import axios from "axios";

const treatment_recommend_router= Router();

treatment_recommend_router.post("/", authMiddleware,async(req:AuthRequest, res:Response)=>{
});

export default treatment_recommend_router;