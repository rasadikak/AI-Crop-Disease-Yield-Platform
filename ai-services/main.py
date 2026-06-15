from fastapi import FastAPI
from routers import crop_yeild_predictor

app= FastAPI()



app.include_router(crop_yeild_predictor.router)
