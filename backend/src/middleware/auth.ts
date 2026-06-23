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


//get current user

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
 
  console.log("Auth header received:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Auth failed — no Bearer token in header");
    res.status(401).json({ error: "No token provided" });
    return;
  }

  
  const token = authHeader.split(" ")[1];

  try {
    
    const farmerId = await verifyToken(token);

    // fetch farmer from database
 
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      select: {
        id: true,
        name: true,
        email: true,
        district: true,
        isVerified: true
        
      }
    });

    
    if (!farmer) {
      console.warn(`Auth failed — farmer not found id:${farmerId}`);
      res.status(401).json({ error: "User not found" });
      return;
    }

    
    req.farmerId = farmer.id;
    req.farmer   = farmer;

  
    next();

  } catch (error) {
    console.error(`Auth middleware failed — error: ${error}`);
    res.status(401).json({ error: "Authentication failed" });
  }
};

export default authMiddleware;







export const createResetToken = (farmerId: number): string => {
  return jwt.sign(
    { farmerId, purpose: "reset" },
    process.env.RESET_PASSWORD_SECRET as string,
    { expiresIn: "1h" }   
  );
};  //for password resetting


export const verifyResetToken = (token: string): number => {
  try {
    const payload = jwt.verify(
      token,
      process.env.RESET_PASSWORD_SECRET as string
    ) as { farmerId: number; purpose: string };

    if (payload.purpose !== "reset") {
      throw new Error("Invalid token purpose");
    }

    return payload.farmerId;

  } catch (error) {
    console.warn("Reset token expired or invalid:", error);
    throw new Error("Token expired or invalid");
  }
};   //for password resseting


export const createVerifyEmailToken = (farmerId: number): string => {
  return jwt.sign(
    { farmerId, purpose: "verify" },
    process.env.VERIFY_EMAIL_SECRET as string,
    { expiresIn: "30m" }
  );
};  //for email verification


export const verifyEmailToken = (token: string): number => {
  try {
    const payload = jwt.verify(
      token,
      process.env.VERIFY_EMAIL_SECRET as string
    ) as { farmerId: number; purpose: string };

    if (payload.purpose !== "verify") {
      throw new Error("Invalid token purpose");
    }

    return payload.farmerId;

  } catch (error) {
    console.warn("Email verification token invalid:", error);
    throw new Error("Invalid or expired verification link");
  }
};   //for email verification