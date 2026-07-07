import {Router, Response} from "express";
import authMiddleware, {AuthRequest} from "../../middleware/auth";
import axios from "axios";

const crop_pred_router= Router();

crop_pred_router.post("/", authMiddleware,async(req:AuthRequest, res:Response)=>{
    const {crop}= req.body;
    const {year}= req.body;
    const {temp}= req.body;
    const {pesticides}= req.body;

    if (!crop || !year || !temp || !pesticides){
        res.status(400).json({error:"all field are required"});
    };

    try{

        const ai_response=await axios.post(`${process.env.FASTAPI_URL}/crop_yield_pred/`,{
            crop, year, temp, pesticides
        });

        const pred= ai_response.data.res;

        res.json({pred});

    }catch(error:any){
        console.error("crop yield pred  error", error);
        res.status(500).json({error:"Failed to process"});
    }
});

export default crop_pred_router;