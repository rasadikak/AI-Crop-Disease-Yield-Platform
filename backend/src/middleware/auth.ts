import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import prisma from "../models/prisma";

export interface AuthRequest extends Request {
  farmerId?: string;
  farmer?: {
    id: string;
    name: string;
    email: string;
    district: string | null;
    isVerified: boolean;
  };
}

export const createToken= async(farmerId:string):Promise<string> =>{
    try{
    const token= jwt.sign({farmerId},
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }  
    );
    return token;
    }catch(error){
        console.log("Failed to create token:",error);
        throw new Error("Token creation failed");
    }
};


export const 