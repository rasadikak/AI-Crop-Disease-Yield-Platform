import {Request, Response, Router} from "express";
import prisma from "../models/prisma";
import {sendEmail} from "..//services/sendEmail";

const router= Router();

router.post("/request_reset_password", async(res:Response, req:Request)=>{

    const email= req.body;
    const existing=  prisma.farmer.findUnique({where:{email}});
    if (!existing){
        res.status(400).json({error:"user not found"});
    } 
    

});