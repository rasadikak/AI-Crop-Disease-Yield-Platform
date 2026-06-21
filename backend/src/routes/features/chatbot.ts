import {Request, Response, Router} from  "express";
import prisma from "../../models/prisma";
import authMiddleware, {AuthRequest} from "../../middleware/auth";
import axios from "axios";


const chatRouter= Router();

chatRouter.post("/message",authMiddleware,async(req:AuthRequest, res:Response)=>{

});

export default chatRouter;