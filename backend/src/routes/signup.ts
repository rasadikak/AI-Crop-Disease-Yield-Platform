import {Request, Response, Router} from "express";
import { hashPassword } from "../utils/password";
import prisma from "../models/prisma";

const router= Router();


router.post("/register", async(req:Request, res:Response)=>{
    const { name, email, password, district } = req.body;

});