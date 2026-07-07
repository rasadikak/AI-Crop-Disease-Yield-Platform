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
        await prisma.chatMessage.create({
        data: {
            farmerId: farmerId as number,
            role: "user",
            content: message
            }
        });

        const recentMessages = await prisma.chatMessage.findMany({
            where: { farmerId },
            orderBy: { createdAt: "desc" },
            skip: 1,     // skip the message we just saved
            take: 10
        });

        // reverse so it's oldest-first
        const history = recentMessages.reverse().map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const aiResponse = await axios.post(`${process.env.FASTAPI_URL}/chat/`, {
            message,
            history
        });

        const reply = aiResponse.data.reply;

        await prisma.chatMessage.create({
        data: {
            farmerId: farmerId as number,
            role: "assistant",
            content: reply
        }
        });

        res.json({ reply });



    }
    catch(error){
        console.error("chat error", error);
        res.status(500).json({error:"Failed to process chat message"});
    }
});

export default chatRouter;