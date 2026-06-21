"""
from fastapi import APIRouter
import pandas as pd
import joblib
import numpy as np

model = joblib.load("models/yield_model.pkl")
feature_columns = joblib.load("models/feature_columns.pkl")

router= APIRouter(tags=['crop_yeild_pred'], prefix='/crop_yeild_pred')






@router.post('/')
def crop_yeild_predictor(crop: str, year: int, temp: float, pesticides: float) -> dict:
    
    
    input_data = {col: 0 for col in feature_columns}
    
    
    input_data["Year"] = year
    input_data["avg_temp"] = temp
    input_data["pesticides_tonnes"] = pesticides
    
    
    crop_column = f"Item_{crop}"
    if crop_column in input_data:
        input_data[crop_column] = 1
    else:
        raise ValueError(f"Unknown crop: {crop}")
    
    
    input_df = pd.DataFrame([input_data])
    
    
    prediction = model.predict(input_df)[0]
    
    
    tree_predictions = [tree.predict(input_df)[0] for tree in model.estimators_]
    lower = np.percentile(tree_predictions, 5)
    upper = np.percentile(tree_predictions, 95)
    
    return {
    "predicted_yield_kg_per_ha": round(float(prediction), 2),
    "confidence_low": round(float(lower), 2),
    "confidence_high": round(float(upper), 2)
}


"""