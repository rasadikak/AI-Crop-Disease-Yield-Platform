import {Request, Response, Router} from "express";
import { hashPassword } from "../utils/password";
import prisma from "../models/prisma";

const registerRouter= Router();


registerRouter.post("/", async(req:Request, res:Response)=>{
    const { name, email, password, district } = req.body;

    if(!name || !email || !password || !district){
        res.status(400).json({error:"Name, email and password are required"});
        return;
    }

    if (password.length <6){
        res.status(400).json({ error: "Password must be at least 6 characters" });
        return;
    }

    try{

        const existing= await prisma.farmer.findUnique({where:{email}});
        if (existing){
            res.status(409).json({error:"user already exists"});
            return;
        }

        const hashed_password= hashPassword(password);

        const user= await prisma.farmer.create({
            data:{name:name, email:email, password:hashed_password, district:district || null}
        });

        res.status(201).json({
            message: "Account created successfully",
            farmerId: user.id
        });

        


    }
    catch(error){
        console.error("user creation failed:", error);
        res.status(500).json({ error: "Something went wrong" });
    }




});



export default registerRouter;