import express from "express";
import cors from "cors";
import authRouter from "./auth/index";
import chatRouter from "./routes/features/chatbot";

const app= express();

app.use(cors({
    origin:"https://localhost:5173",  //react dev server
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]

}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);

app.use("/api/chat", chatRouter)

app.get("/health", (req,res)=>{
    res.json({status: "ok", message:"AgriSense API running"});
});



//POST http://localhost:3000/api/auth/register
//POST http://localhost:3000/api/auth/login
//POST http://localhost:3000/api/auth/logout

//POST http://localhost:3000/api/auth/forgot-password/request
//GET  http://localhost:3000/api/auth/forgot-password/reset-link?token=xxx
//POST http://localhost:3000/api/auth/forgot-password/reset

//POST http://localhost:3000/api/auth/verify-email/request_verify_link
//GET  http://localhost:3000/api/auth/verify-email/verify?token=xxx

//post http://localhost:3000/api/chat/message






export default app;
    
