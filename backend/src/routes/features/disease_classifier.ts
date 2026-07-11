import {Router, Response} from "express";
import authMiddleware, {AuthRequest} from "../../middleware/auth";
import axios from "axios";

const disease_classifier_router= Router();

disease_classifier_router.post("/", authMiddleware,async(req:AuthRequest, res:Response)=>{
});

export default disease_classifier_router;