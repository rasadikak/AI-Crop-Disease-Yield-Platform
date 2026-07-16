from fastapi import FastAPI
from routers import crop_yeild_predictor, chatbot, weather_anomaly_detector

app= FastAPI()



app.include_router(crop_yeild_predictor.router)
app.include_router(chatbot.router)
app.include_router(weather_anomaly_detector.router)
