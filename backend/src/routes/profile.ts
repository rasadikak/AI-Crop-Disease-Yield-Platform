import {Router, Response} from "express";
import authMiddleware, {AuthRequest} from "../middleware/auth";

const profileRouter= Router();



//get farmers name, district, email
profileRouter.post("/get-farmer-info", authMiddleware,async(req:AuthRequest, res:Response)=>{

    try{

    }catch(error:any){
        console.error("Get profile failed:", error);
        res.status(500).json({error:"Failed to get profile"});
    }

});

//change name
profileRouter.put("/update-name", async(req:AuthRequest, res:Response)=>{
    try{

    }catch(error:any){
        console.error("can not updatename:", error);
        res.status(500).json({error:"Failed to edit name"});
    }

});

//change district
profileRouter.put("/update-district", async(req:AuthRequest, res:Response)=>{
    try{

    }catch(error:any){
        console.error("can not update district:", error);
        res.status(500).json({error:"Failed to edit district"});
    }

});

//delete account

profileRouter.delete("/delete-account", async(req:AuthRequest, res:Response)=>{
    try{

    }catch(error:any){
        console.error("can not delete account:", error);
        res.status(500).json({error:"Failed delete account"});
    }

});

export default profileRouter;


//mulinm profile.ts eke routers hadla
//frontend ekata e tika aran
//profilepage,tsx hadala connect krnn