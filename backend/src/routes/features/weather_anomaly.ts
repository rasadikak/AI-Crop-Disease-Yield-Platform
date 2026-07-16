import {Router, Request, Response} from "express";
import authMiddleware, {AuthRequest} from "../../middleware/auth";
import axios from "axios";

const weather_anomaly_router= Router();

weather_anomaly_router.post("/",authMiddleware, async(req:AuthRequest, res:Response)=>{
    const {district}= req.body;

    if (!district){
        res.status(400).json({error:"all field are required"});
        return;
    }
    try{
        const ai_response= axios.post(`${process.env.FASTAPI_URL}/weather_anomaly/`,{
            district
        });
        res.json(ai_response);


    }catch(error:any){
        console.error("crop yield pred  error", error);
        res.status(500).json({error:"Failed to process"});

    }

});


export default weather_anomaly_router;