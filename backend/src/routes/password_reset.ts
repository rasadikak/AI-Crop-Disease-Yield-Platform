import {Request, Response, Router} from "express";
import prisma from "../models/prisma";
import {sendEmail} from "../services/sendEmail";
import {createResetToken} from "../middleware/auth"

const router= Router();

router.post("/request_reset_password", async(res:Response, req:Request)=>{

    const email= req.body;
    const existing=  prisma.farmer.findUnique({where:{email}});
    if (!existing){
        res.status(400).json({error:"user not found"});
    } 
    try{
        const token= createResetToken(existing.id)
        sendEmail(email, existing.name, "passwordResetting", token);
        console.log("password resetting email sent successfully");
    }
    catch(error){
        console.error("", error);
        throw new Error("");
    }


});



router.get("")