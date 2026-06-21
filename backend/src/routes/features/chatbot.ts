import {Request, Response, Router} from  "express";
import prisma from "../../models/prisma";
import authMiddleware, {AuthRequest} from "../../middleware/auth";
import axios from "axios";


const chatRouter= Router();

chatRouter.post("/message",authMiddleware,async(req:AuthRequest, res:Response)=>{
    const {message}= req.body;
    const farmerId = req.farmerId;

    if (!message){
        res.status(400).json({error:"Message is required"});
        return;
    }

    try{
        

    }
    catch(error){
        console.error("chat error", error);
        res.status(500).json({error:"Failed to process chat message"});
    }
});

export default chatRouter;