import {Request, Response, Router} from "express";
import { hashPassword } from "../utils/password";
import prisma from "../models/prisma";

const router= Router();


router.post("/register", async(req:Request, res:Response)=>{
    const { name, email, password, district } = req.body;

    if(!name || !email || !password || !district){
        res.status(400).json({error:"Name, email and password are required"});
        return;
    }

    if (password.length <6){
        res.status(400).json({ error: "Password must be at least 6 characters" });
        return;
    }
    

});