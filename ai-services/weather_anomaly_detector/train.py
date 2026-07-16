import requests
import os
import time
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

os.makedirs("models", exist_ok=True)


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
    1: "January", 2: "February", 3: "March",    4: "April",
    5: "May",     6: "June",     7: "July",      8: "August",
    9: "September",10:"October", 11:"November",  12:"December"
}

if __name__ == "__main__":
    for dis_name, coords in DISTRICTS.items():

        if os.path.exists(f"models/{dis_name}_anomaly.pkl"):
            print(f"Already exists — skipping {dis_name}")
            continue

        try:
            print(f"Fetching data for {dis_name}...")
            response = requests.get(
                "https://archive-api.open-meteo.com/v1/archive",
                params={
                    "latitude":   coords["lat"],
                    "longitude":  coords["lon"],
                    "start_date": "2000-01-01",
                    "end_date":   "2025-12-31",
                    "daily":      "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min",
                    "timezone":   "Asia/Colombo"
                }
            )
            data = response.json()

            if "daily" not in data:
                print(f"Skipped {dis_name} — API error: {data}")
                continue

            df = pd.DataFrame(data["daily"])
            df["time"]  = pd.to_datetime(df["time"])
            df["year"]  = df["time"].dt.year
            df["month"] = df["time"].dt.month

            df_monthly = df.groupby(["year", "month"]).agg(
                temp_max    = ("temperature_2m_max",        "mean"),
                temp_min    = ("temperature_2m_min",        "mean"),
                rainfall    = ("precipitation_sum",         "sum"),
                humidity_max= ("relative_humidity_2m_max",  "mean"),
                humidity_min= ("relative_humidity_2m_min",  "mean")
            ).reset_index()

            
            historical_avg = df_monthly.groupby("month")[FEATURE_COLS].mean()
            joblib.dump(historical_avg, f"models/{dis_name}_historical_avg.pkl")

            
            X     = df_monthly[FEATURE_COLS]
            model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
            model.fit(X)
            joblib.dump(model, f"models/{dis_name}_anomaly.pkl")

            print(f"✓ Saved {dis_name}_anomaly.pkl")
            time.sleep(60) 

        except Exception as e:
            print(f"✗ Skipped {dis_name} — {e}")
            continue

    print("\nTraining complete.")