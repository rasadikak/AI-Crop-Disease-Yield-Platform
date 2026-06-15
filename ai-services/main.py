from fastapi import FastAPI, router
from routers import crop_yeild_predictor

app= FastAPI()
router= app.router()


app.include_router(crop_yeild_predictor)
