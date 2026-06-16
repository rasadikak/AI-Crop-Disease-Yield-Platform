import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import prisma from "../models/prisma";

export interface AuthRequest extends Request {
  farmerId?: number;
  farmer?: {
    id: number;
    name: string;
    email: string;
    district: string | null;
    isVerified: boolean;
  };
}

export const createToken= async(farmerId:number):Promise<string> =>{
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


export const verifyToken= async(token:string):Promise<number>=>{
    try{
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET as string       
            ) as { farmerId: number };
        if(!payload.farmerId){
             console.warn("Token verification failed — farmerId missing in payload");
             throw new Error("Invalid token payload");
        }
        return payload.farmerId;

    }catch{
        console.warn("Token verification failed — invalid or expired token");
        throw new Error("Invalid or expired token");
    }

};