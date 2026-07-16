import {Router, Request, Response} from "express";
import authMiddleware, {AuthRequest} from "../../middleware/auth";

const weather_anomaly_router= Router();

weather_anomaly_router.post("/",authMiddleware, async(req:AuthRequest, res:Response)=>{
    const {district}= req.body;

});


export default weather_anomaly_router;