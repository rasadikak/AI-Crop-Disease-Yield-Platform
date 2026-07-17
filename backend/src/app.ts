import express from "express";
import cors from "cors";
import authRouter from "./auth/index";
import chatRouter from "./routes/features/chatbot";
import crop_pred_router from "./routes/features/crop_yield_pred";
import disease_classifier_router from "./routes/features/disease_classifier";
import weather_anomaly_router from "./routes/features/weather_anomaly";
import treatment_recommender_router from "./routes/features/treatment_recommender";


const app= express();

app.use(cors({
    origin:["http://localhost:5173", "https://localhost:5173"],  // react dev server
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]

}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);

app.use("/api/chat", chatRouter);
app.use("/api/crop_yield_predictor", crop_pred_router);
app.use("/api/disease_classifier", disease_classifier_router);

app.use("/api/weather_anomaly", weather_anomaly_router)
app.use("/api/treatment", treatment_recommender_router)

app.get("/health", (req,res)=>{
    res.json({status: "ok", message:"AgriSense API running"});
});



//POST http://localhost:3000/api/auth/register
//POST http://localhost:3000/api/auth/login
//POST http://localhost:3000/api/auth/logout

//POST http://localhost:3000/api/auth/forgot-password/request
//GET  http://localhost:3000/api/auth/forgot-password/reset-link?token=xxx
//POST http://localhost:3000/api/auth/forgot-password/reset


//put http://localhost:3000/api/auth/profile/update-name
//put http://localhost:3000/api/auth/profile/update-district
//delete http://localhost:3000/api/auth/profile/delete-account


//POST http://localhost:3000/api/auth/verify-email/request_verify_link
//GET  http://localhost:3000/api/auth/verify-email/verify?token=xxx

//post http://localhost:3000/api/chat/message
//post http://localhost:3000/api/crop_yield_predictor
//post http://localhost:3000/api/disease
//post http://localhost:3000/api/weather_anomaly
//post http://localhost:3000/api/treatment






export default app;
    
