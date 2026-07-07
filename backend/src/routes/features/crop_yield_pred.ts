import {Router, Response} from "express";
import authMiddleware, {AuthRequest} from "../../middleware/auth";

const crop_pred_router= Router();

crop_pred_router.post("/", authMiddleware,async(req:AuthRequest, res:Response)=>{
    const {crop}= req.body;
    const {year}= req.body;
    const {temp}= req.body;
    const {pesticides}= req.body;
});

export default crop_pred_router;