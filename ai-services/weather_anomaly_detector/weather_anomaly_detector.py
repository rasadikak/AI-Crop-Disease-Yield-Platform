import requests
import os
import time
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import pandas as pd
import joblib
import requests

os.makedirs("models", exist_ok=True)

districts = {
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

feature_cols = ["temp_max", "temp_min", "rainfall", "humidity_max", "humidity_min"]

for dis_name, coords in districts.items():

    if os.path.exists(f"models/{dis_name}_anomaly.pkl"):
        print(f"Already exists — skipping {dis_name}")
        continue

    try:
        result = requests.get(
            f"https://archive-api.open-meteo.com/v1/archive"
            f"?latitude={coords['lat']}&longitude={coords['lon']}"
            f"&start_date=2000-01-01&end_date=2025-12-31"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,"
            f"relative_humidity_2m_max,relative_humidity_2m_min"
            f"&timezone=Asia%2FColombo"
        )
        result = result.json()

        if "daily" not in result:
            print(f"Skipped {dis_name} — API error: {result}")
            continue

        daily_result = result["daily"]

        df = pd.DataFrame(daily_result)
        df["time"] = pd.to_datetime(df["time"])
        df["year"] = df["time"].dt.year
        df["month"] = df["time"].dt.month

        df_monthly = df.groupby(["year", "month"]).agg(
            temp_max=("temperature_2m_max", "mean"),
            temp_min=("temperature_2m_min", "mean"),
            rainfall=("precipitation_sum", "sum"),
            humidity_max=("relative_humidity_2m_max", "mean"),
            humidity_min=("relative_humidity_2m_min", "mean")
        ).reset_index()

        historical_avg = df_monthly.groupby("month")[feature_cols].mean()
        joblib.dump(historical_avg, f"models/{dis_name}_historical_avg.pkl")

        x = df_monthly[feature_cols]
        model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        model.fit(x)
        joblib.dump(model, f"models/{dis_name}_anomaly.pkl")

        print(f"Saved {dis_name}_anomaly.pkl")
        time.sleep(60)

    except Exception as e:
        print(f"Skipped {dis_name} — {e}")
        continue




def predict_anomaly(district: str) -> dict:
    
    
    end_date = datetime.today()
    start_date = end_date - timedelta(days=90)
    
    end_str = end_date.strftime("%Y-%m-%d")
    start_str = start_date.strftime("%Y-%m-%d")
    
    
    coords = districts[district]
    
    
    result = requests.get(
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={coords['lat']}&longitude={coords['lon']}"
        f"&start_date={start_str}&end_date={end_str}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,"
        f"relative_humidity_2m_max,relative_humidity_2m_min"
        f"&timezone=Asia%2FColombo"
    )
    data = result.json()
    
    if "daily" not in data:
        return {"district": district, "is_anomaly": False, "error": "Weather data unavailable"}
    
    
    df = pd.DataFrame(data["daily"])
    df["time"] = pd.to_datetime(df["time"])
    df["year"] = df["time"].dt.year
    df["month"] = df["time"].dt.month
    
    df_monthly = df.groupby(["year", "month"]).agg(
        temp_max=("temperature_2m_max", "mean"),
        temp_min=("temperature_2m_min", "mean"),
        rainfall=("precipitation_sum", "sum"),
        humidity_max=("relative_humidity_2m_max", "mean"),
        humidity_min=("relative_humidity_2m_min", "mean")
    ).reset_index()
    
    
    model = joblib.load(f"models/{district}_anomaly.pkl")
    historical_avg = joblib.load(f"models/{district}_historical_avg.pkl")
    
    
    feature_cols = ["temp_max", "temp_min", "rainfall", "humidity_max", "humidity_min"]
    X = df_monthly[feature_cols]
    predictions = model.predict(X)  # 1 = normal, -1 = anomaly
    
    
    alerts = []
    month_names = {1:"January",2:"February",3:"March",4:"April",
                   5:"May",6:"June",7:"July",8:"August",
                   9:"September",10:"October",11:"November",12:"December"}
    
    for i, pred in enumerate(predictions):
        if pred == -1:  
            row = df_monthly.iloc[i]
            month_num = int(row["month"])
            year_num = int(row["year"])
            month_name = f"{month_names[month_num]} {year_num}"
            
            
            hist = historical_avg.loc[month_num]
            
            
            rainfall_diff = ((row["rainfall"] - hist["rainfall"]) / hist["rainfall"]) * 100
            temp_diff = row["temp_max"] - hist["temp_max"]
            
            
            if rainfall_diff < -40:
                alert_type = "drought"
                message = f"Rainfall {abs(rainfall_diff):.0f}% below {month_names[month_num]} average in {district.title()}"
            elif rainfall_diff > 40:
                alert_type = "flood_risk"
                message = f"Rainfall {rainfall_diff:.0f}% above {month_names[month_num]} average in {district.title()}"
            elif temp_diff > 3:
                alert_type = "heat_spike"
                message = f"Temperature {temp_diff:.1f}°C above {month_names[month_num]} average in {district.title()}"
            elif temp_diff < -3:
                alert_type = "cold_spell"
                message = f"Temperature {abs(temp_diff):.1f}°C below {month_names[month_num]} average in {district.title()}"
            else:
                alert_type = "unusual_weather"
                message = f"Unusual weather pattern detected in {district.title()} for {month_name}"
            
            alerts.append({
                "month": month_name,
                "type": alert_type,
                "message": message,
                "rainfall_mm": round(float(row["rainfall"]), 1),
                "avg_temp": round(float(row["temp_max"]), 1),
            })
    
    return {
        "district": district,
        "is_anomaly": len(alerts) > 0,
        "alerts": alerts,
        "checked_months": len(predictions),
        "anomalous_months": len(alerts)
    }



result = predict_anomaly("colombo")
print(result)
