import express from "express";
import cors from "cors";
import authRouter from "./auth/index";

const app= express();

app.use(cors({
    origin:"https://localhost:5173",  //react dev server
    credentials: true

}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);

app.get("/health", (req,res)=>{
    res.json({status: "ok", message:"AgriSense API running"});
});






export default app;
    
