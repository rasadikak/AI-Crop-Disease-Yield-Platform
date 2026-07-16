from fastapi import APIRouter
import httpx                          
from datetime import datetime, timedelta
import pandas as pd
import joblib
from pathlib import Path
from pydantic import BaseModel

router= APIRouter(prefix='/weather_anomaly', tags=['weather_anomaly'])

DISTRICTS = {
    "colombo":       {"lat": 6.9271,  "lon": 79.8612},
    "kandy":         {"lat": 7.2906,  "lon": 80.6337},
    "galle":         {"lat": 6.0535,  "lon": 80.2210},
    "jaffna":        {"lat": 9.6615,  "lon": 80.0255},
    "anuradhapura":  {"lat": 8.3114,  "lon": 80.4037},
    "kurunegala":    {"lat": 7.4863,  "lon": 80.3647},
    "polonnaruwa":   {"lat": 7.9403,  "lon": 81.0188},
    "ratnapura":     {"lat": 6.6828,  "lon": 80.3992},
    "trincomalee":   {"lat": 8.5874,  "lon": 81.2152},
    "batticaloa":    {"lat": 7.7170,  "lon": 81.7000},
    "ampara":        {"lat": 7.2977,  "lon": 81.6747},
    "badulla":       {"lat": 6.9934,  "lon": 81.0550},
    "matara":        {"lat": 5.9549,  "lon": 80.5550},
    "hambantota":    {"lat": 6.1429,  "lon": 81.1212},
    "matale":        {"lat": 7.4675,  "lon": 80.6234},
    "nuwara_eliya":  {"lat": 6.9497,  "lon": 80.7891},
    "kegalle":       {"lat": 7.2513,  "lon": 80.3464},
    "kalutara":      {"lat": 6.5854,  "lon": 79.9607},
    "gampaha":       {"lat": 7.0873,  "lon": 80.0144},
    "puttalam":      {"lat": 8.0362,  "lon": 79.8283},
    "mannar":        {"lat": 8.9810,  "lon": 79.9044},
    "vavuniya":      {"lat": 8.7514,  "lon": 80.4971},
    "mullaitivu":    {"lat": 9.2671,  "lon": 80.8128},
    "kilinochchi":   {"lat": 9.3803,  "lon": 80.4006},
    "monaragala":    {"lat": 6.8728,  "lon": 81.3507},
}

FEATURE_COLS = ["temp_max", "temp_min", "rainfall", "humidity_max", "humidity_min"]

MONTH_NAMES = {
    1: "January",  2: "February", 3: "March",    4: "April",
    5: "May",      6: "June",     7: "July",      8: "August",
    9: "September",10: "October", 11: "November", 12: "December"
}


DISTRICT_NAME_MAP: dict[str, str] = {
    "Ampara":        "ampara",
    "Anuradhapura":  "anuradhapura",
    "Badulla":       "badulla",
    "Batticaloa":    "batticaloa",
    "Colombo":       "colombo",
    "Galle":         "galle",
    "Gampaha":       "gampaha",
    "Hambantota":    "hambantota",
    "Jaffna":        "jaffna",
    "Kalutara":      "kalutara",
    "Kandy":         "kandy",
    "Kegalle":       "kegalle",
    "Kilinochchi":   "kilinochchi",
    "Kurunegala":    "kurunegala",
    "Mannar":        "mannar",
    "Matale":        "matale",
    "Matara":        "matara",
    "Monaragala":    "monaragala",
    "Mullaitivu":    "mullaitivu",
    "Nuwara Eliya":  "nuwara_eliya",  
    "Polonnaruwa":   "polonnaruwa",
    "Puttalam":      "puttalam",
    "Ratnapura":     "ratnapura",
    "Trincomalee":   "trincomalee",
    "Vavuniya":      "vavuniya",
}

MODELS_DIR = Path(__file__).parent.parent / "weather_anomaly_detector" / "models"
#print(MODELS_DIR)

class anomaly_request(BaseModel):
    district:str


def normalize_district(district: str) -> str:
    """Convert frontend district name to model file key."""
   
    if district in DISTRICT_NAME_MAP:
        return DISTRICT_NAME_MAP[district]
    
    lower = district.lower().replace(" ", "_")
    if lower in DISTRICTS:
        return lower
    raise ValueError(f"Unknown district: {district}")

@router.post('/')
async def predict_anomaly(request:anomaly_request) -> dict:
    
    try:
        district= request.district
        district_key = normalize_district(district)
    except ValueError as e:
        return {"error": str(e), "is_anomaly": False}

    
    model_path   = MODELS_DIR / f"{district_key}_anomaly.pkl"
    avg_path     = MODELS_DIR / f"{district_key}_historical_avg.pkl"

    if not model_path.exists() or not avg_path.exists():
        return {
            "district":   district,
            "is_anomaly": False,
            "error":      f"Model not trained yet for {district}. Run train.py first."
        }

    
    end_date   = datetime.today()
    start_date = end_date - timedelta(days=90)
    coords     = DISTRICTS[district_key]

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://archive-api.open-meteo.com/v1/archive",
            params={
                "latitude":   coords["lat"],
                "longitude":  coords["lon"],
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date":   end_date.strftime("%Y-%m-%d"),
                "daily":      "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min",
                "timezone":   "Asia/Colombo"
            },
            timeout=30.0
        )

    data = response.json()

    if "daily" not in data:
        return {
            "district":   district,
            "is_anomaly": False,
            "error":      "Weather data unavailable from Open-Meteo"
        }

    
    df          = pd.DataFrame(data["daily"])
    df["time"]  = pd.to_datetime(df["time"])
    df["year"]  = df["time"].dt.year
    df["month"] = df["time"].dt.month

    df_monthly = df.groupby(["year", "month"]).agg(
        temp_max     = ("temperature_2m_max",       "mean"),
        temp_min     = ("temperature_2m_min",       "mean"),
        rainfall     = ("precipitation_sum",        "sum"),
        humidity_max = ("relative_humidity_2m_max", "mean"),
        humidity_min = ("relative_humidity_2m_min", "mean")
    ).reset_index()

    
    model          = joblib.load(model_path)
    historical_avg = joblib.load(avg_path)

    
    X           = df_monthly[FEATURE_COLS]
    predictions = model.predict(X)  # 1 = normal, -1 = anomaly

    
    alerts = []
    for i, pred in enumerate(predictions):
        if pred == -1:
            row        = df_monthly.iloc[i]
            month_num  = int(row["month"])
            year_num   = int(row["year"])
            month_name = f"{MONTH_NAMES[month_num]} {year_num}"
            hist       = historical_avg.loc[month_num]

            
            rainfall_diff = ((row["rainfall"] - hist["rainfall"]) / hist["rainfall"]) * 100 \
                            if hist["rainfall"] > 0 else 0
            temp_diff     = row["temp_max"] - hist["temp_max"]

            if rainfall_diff < -40:
                alert_type = "drought"
                message    = f"Rainfall {abs(rainfall_diff):.0f}% below {MONTH_NAMES[month_num]} average in {district}"
            elif rainfall_diff > 40:
                alert_type = "flood_risk"
                message    = f"Rainfall {rainfall_diff:.0f}% above {MONTH_NAMES[month_num]} average in {district}"
            elif temp_diff > 3:
                alert_type = "heat_spike"
                message    = f"Temperature {temp_diff:.1f}°C above {MONTH_NAMES[month_num]} average in {district}"
            elif temp_diff < -3:
                alert_type = "cold_spell"
                message    = f"Temperature {abs(temp_diff):.1f}°C below {MONTH_NAMES[month_num]} average in {district}"
            else:
                alert_type = "unusual_weather"
                message    = f"Unusual weather pattern detected in {district} for {month_name}"

            alerts.append({
                "month":       month_name,
                "type":        alert_type,
                "message":     message,
                "rainfall_mm": round(float(row["rainfall"]), 1),
                "avg_temp":    round(float(row["temp_max"]), 1),
            })

    print({
        "district":         district,
        "is_anomaly":       len(alerts) > 0,
        "alerts":           alerts,
        "checked_months":   len(predictions),
        "anomalous_months": len(alerts)
    })

    

    return {
        "district":         district,
        "is_anomaly":       len(alerts) > 0,
        "alerts":           alerts,
        "checked_months":   len(predictions),
        "anomalous_months": len(alerts)
    }