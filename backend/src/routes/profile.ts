import {Router, Response} from "express";
import authMiddleware, {AuthRequest} from "../middleware/auth";
import prisma from "../models/prisma";

const profileRouter= Router();





//change name
profileRouter.put("/update-name", authMiddleware,async(req:AuthRequest, res:Response)=>{
    try{
        const {new_name}= req.body;
        const userId= req.farmerId;
        
        if (!userId){
            res.status(401).json({error:"Unauthorized"});
            return;
        };

        if (!new_name || typeof new_name !== "string" || !new_name.trim()) {
            res.status(400).json({ error: "Name is required" });
            return;
        }

        const updated_name = new_name.trim();

        if (updated_name.length < 2 || updated_name.length > 100) {
            res.status(400).json({ error: "Name must be between 2 and 100 characters" });
            return;
        }

        const existing = await prisma.farmer.findUnique({ where: { id: userId } });
        if (!existing) {
            res.status(404).json({ error: "User does not exist" }); 
            return;
        }

        await prisma.farmer.update({
            where:{id:userId},
            data:{name:updated_name}
        });
        res.json({ message: "name updated successfully" });


    }catch(error:any){
        console.error("can not update name:", error);
        res.status(500).json({error:"Failed to edit name"});
    }

});

//change district
profileRouter.put("/update-district",authMiddleware, async(req:AuthRequest, res:Response)=>{
    try{
        const {new_district}= req.body;
        const userId= req.farmerId;
        
        if (!userId){
            res.status(401).json({error:"Unauthorized"});
            return;
        };

        if (!new_district) {
            res.status(400).json({ error: "district is required" });
            return;
        }

        

        const existing = await prisma.farmer.findUnique({ where: { id: userId } });
        if (!existing) {
            res.status(404).json({ error: "User does not exist" }); 
            return;
        }

        await prisma.farmer.update({
            where:{id:userId},
            data:{district:new_district}
        });
        res.json({ message: "district updated successfully" });


    }catch(error:any){
        console.error("can not update district:", error);
        res.status(500).json({error:"Failed to update district"});
    }

});

//delete account

profileRouter.delete("/delete-account", authMiddleware,async(req:AuthRequest, res:Response)=>{
    try{
        const userId= req.farmerId;

        if (!userId){
            res.status(401).json({error:"Unauthorized"});
            return;
        };

        const existing = await prisma.farmer.findUnique({ where: { id: userId } });
        if (!existing) {
            res.status(404).json({ error: "User does not exist" }); 
            return;
        }

        

    }catch(error:any){
        console.error("can not delete account:", error);
        res.status(500).json({error:"Failed delete account"});
    }

});

export default profileRouter;


