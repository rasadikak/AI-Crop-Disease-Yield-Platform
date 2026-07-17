import os
import json
import numpy as np
import pandas as pd
import joblib
import requests
from datetime import datetime
from sklearn.ensemble import IsolationForest

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

os.makedirs("metrics", exist_ok=True)


def fetch_training_data(dis_name: str, coords: dict) -> pd.DataFrame | None:
    """Re-fetch the same historical data used during training."""
    try:
        response = requests.get(
            "https://archive-api.open-meteo.com/v1/archive",
            params={
                "latitude":   coords["lat"],
                "longitude":  coords["lon"],
                "start_date": "2000-01-01",
                "end_date":   "2025-12-31",
                "daily":      "temperature_2m_max,temperature_2m_min,precipitation_sum,"
                              "relative_humidity_2m_max,relative_humidity_2m_min",
                "timezone":   "Asia/Colombo"
            },
            timeout=30
        )
        data = response.json()
        if "daily" not in data:
            return None

        df          = pd.DataFrame(data["daily"])
        df["time"]  = pd.to_datetime(df["time"])
        df["year"]  = df["time"].dt.year
        df["month"] = df["time"].dt.month
        df.dropna(subset=["temperature_2m_max", "precipitation_sum"], inplace=True)
        return df

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None


def evaluate_district(dis_name: str, coords: dict) -> dict:
    model_path = f"models/{dis_name}_anomaly.pkl"
    avg_path   = f"models/{dis_name}_historical_avg.pkl"

    if not os.path.exists(model_path):
        return {"status": "no_model"}

    print(f"\n{'─'*50}")
    print(f"Evaluating: {dis_name.upper()}")
    print(f"{'─'*50}")

    # load existing model
    model          = joblib.load(model_path)
    historical_avg = joblib.load(avg_path)

    # re-fetch historical data for evaluation
    print(f"  Fetching historical data...")
    df = fetch_training_data(dis_name, coords)
    if df is None:
        return {"status": "fetch_failed"}

    df_monthly = df.groupby(["year", "month"]).agg(
        temp_max     = ("temperature_2m_max",       "mean"),
        temp_min     = ("temperature_2m_min",       "mean"),
        rainfall     = ("precipitation_sum",        "sum"),
        humidity_max = ("relative_humidity_2m_max", "mean"),
        humidity_min = ("relative_humidity_2m_min", "mean")
    ).reset_index().dropna(subset=FEATURE_COLS)

    X           = df_monthly[FEATURE_COLS]
    predictions = model.predict(X.values)
    scores      = model.score_samples(X.values)

    total_months    = len(predictions)
    anomaly_months  = int(np.sum(predictions == -1))
    anomaly_rate    = anomaly_months / total_months

    print(f"  Total months: {total_months}")
    print(f"  Anomalies:    {anomaly_months} ({anomaly_rate:.1%})")

    # score separation — how well model separates normal from anomalous
    normal_scores  = scores[predictions == 1]
    anomaly_scores = scores[predictions == -1]
    score_sep      = float(normal_scores.mean() - anomaly_scores.mean()) if len(anomaly_scores) > 0 else None
    print(f"  Score separation: {score_sep:.4f}" if score_sep else "  Score separation: N/A")

    # feature deviations in anomalous months
    X_df = X.copy()
    X_df["predicted"] = predictions
    feature_deviations = {}
    if anomaly_months > 0:
        normal_means  = X_df[X_df["predicted"] == 1][FEATURE_COLS].mean()
        anomaly_means = X_df[X_df["predicted"] == -1][FEATURE_COLS].mean()
        normal_stds   = X_df[X_df["predicted"] == 1][FEATURE_COLS].std().replace(0, 1)
        for col in FEATURE_COLS:
            dev = abs(anomaly_means[col] - normal_means[col]) / normal_stds[col]
            feature_deviations[col] = round(float(dev), 3)

    most_anomalous_feature = max(feature_deviations, key=feature_deviations.get) if feature_deviations else None
    print(f"  Most anomalous feature: {most_anomalous_feature}")

    # temporal validation — train on 2000-2020, test on 2021-2025
    train_df = df_monthly[df_monthly["year"] <= 2020]
    test_df  = df_monthly[df_monthly["year"] >= 2021]

    val_result = {}
    if len(train_df) >= 12 and len(test_df) >= 3:
        val_model = IsolationForest(
            n_estimators=100,
            contamination=model.contamination,
            random_state=42
        )
        val_model.fit(train_df[FEATURE_COLS].values)
        val_preds         = val_model.predict(test_df[FEATURE_COLS].values)
        val_anomaly_count = int(np.sum(val_preds == -1))
        val_anomaly_rate  = val_anomaly_count / len(val_preds)
        print(f"  Temporal val: {val_anomaly_count}/{len(val_preds)} anomalies ({val_anomaly_rate:.1%})")

        val_result = {
            "train_samples":      len(train_df),
            "test_samples":       len(test_df),
            "test_anomaly_count": val_anomaly_count,
            "test_anomaly_rate":  round(val_anomaly_rate, 4),
        }

    # seasonal stats
    seasonal_stats = {}
    for month in range(1, 13):
        month_data = df_monthly[df_monthly["month"] == month]
        if len(month_data) == 0:
            continue
        seasonal_stats[month] = {
            "mean_rainfall": round(float(month_data["rainfall"].mean()), 1),
            "std_rainfall":  round(float(month_data["rainfall"].std()), 1),
            "mean_temp_max": round(float(month_data["temp_max"].mean()), 1),
            "std_temp_max":  round(float(month_data["temp_max"].std()), 1),
            "sample_count":  len(month_data)
        }

    metrics = {
        "district":              dis_name,
        "evaluated_at":          datetime.now().isoformat(),
        "total_monthly_records": total_months,
        "year_range":            f"{int(df_monthly['year'].min())}–{int(df_monthly['year'].max())}",
        "contamination":         float(model.contamination),
        "training_anomalies":    anomaly_months,
        "training_anomaly_rate": round(anomaly_rate, 4),
        "score_separation":      round(score_sep, 4) if score_sep else None,
        "feature_deviations":    feature_deviations,
        "most_anomalous_feature":most_anomalous_feature,
        "temporal_validation":   val_result,
        "seasonal_stats":        seasonal_stats,
    }

    with open(f"metrics/{dis_name}_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"  ✓ Saved metrics/{dis_name}_metrics.json")
    return {"status": "success", **metrics}


if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"AgriSense Weather Anomaly Model Evaluation")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

    results = {}
    for dis_name, coords in DISTRICTS.items():
        results[dis_name] = evaluate_district(dis_name, coords)
        import time; time.sleep(2)

    # summary
    success = [d for d, r in results.items() if r.get("status") == "success"]
    print(f"\n{'='*60}")
    print(f"EVALUATION COMPLETE")
    print(f"{'='*60}")
    print(f"\n{'District':<15} {'Months':<8} {'Anomaly%':<12} {'Score Sep':<12} {'Top Feature'}")
    print(f"{'─'*60}")
    for d in success:
        r = results[d]
        print(
            f"{d:<15} "
            f"{r.get('total_monthly_records', 'N/A'):<8} "
            f"{r.get('training_anomaly_rate', 0):<12.1%} "
            f"{str(r.get('score_separation', 'N/A')):<12} "
            f"{r.get('most_anomalous_feature', 'N/A')}"
        )

    with open("metrics/evaluation_summary.json", "w") as f:
        json.dump({
            "evaluated_at": datetime.now().isoformat(),
            "results":      {d: {k: v for k, v in r.items() if k != "seasonal_stats"}
                             for d, r in results.items()}
        }, f, indent=2)

    print(f"\n✓ Evaluation complete. Metrics saved to metrics/")