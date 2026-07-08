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
        return;
    };

    try{

        const ai_response=await axios.post(`${process.env.FASTAPI_URL}/crop_yield_pred/`,{
            crop, year, temp, pesticides
        });

        

        res.json(ai_response.data);

    }catch(error:any){

        if (error.response?.status === 400) {
        res.status(400).json({ error: error.response.data.detail });
        return;
        }
        console.error("crop yield pred  error", error);
        res.status(500).json({error:"Failed to process"});
    }
});

export default crop_pred_router;