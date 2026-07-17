import requests
import os
import time
import pandas as pd
import numpy as np
import joblib
import json
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime

os.makedirs("models", exist_ok=True)
os.makedirs("metrics", exist_ok=True)

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

CONTAMINATION_VALUES = [0.03, 0.05, 0.08, 0.10]
BEST_CONTAMINATION   = 0.05   # default if sensitivity analysis inconclusive


def fetch_historical_data(dis_name: str, coords: dict) -> pd.DataFrame | None:
    """Fetch 25 years of daily weather from Open-Meteo archive."""
    print(f"  Fetching data for {dis_name}...")
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
            print(f"  ✗ API error for {dis_name}: {data.get('reason', 'unknown')}")
            return None

        df          = pd.DataFrame(data["daily"])
        df["time"]  = pd.to_datetime(df["time"])
        df["year"]  = df["time"].dt.year
        df["month"] = df["time"].dt.month

        # drop rows with all NaN weather values
        df.dropna(subset=["temperature_2m_max", "precipitation_sum"], inplace=True)

        print(f"  ✓ Fetched {len(df)} daily records ({df['year'].min()}–{df['year'].max()})")
        return df

    except requests.exceptions.Timeout:
        print(f"  ✗ Timeout fetching {dis_name}")
        return None
    except Exception as e:
        print(f"  ✗ Error fetching {dis_name}: {e}")
        return None


def aggregate_monthly(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate daily data into monthly features."""
    df_monthly = df.groupby(["year", "month"]).agg(
        temp_max     = ("temperature_2m_max",       "mean"),
        temp_min     = ("temperature_2m_min",       "mean"),
        rainfall     = ("precipitation_sum",        "sum"),
        humidity_max = ("relative_humidity_2m_max", "mean"),
        humidity_min = ("relative_humidity_2m_min", "mean")
    ).reset_index()

    # drop months with missing feature values
    df_monthly.dropna(subset=FEATURE_COLS, inplace=True)

    return df_monthly


def contamination_sensitivity_analysis(X: np.ndarray, dis_name: str) -> float:
    """
    Train models with different contamination values.
    Returns the contamination value where anomaly rate stabilises.
    This is the unsupervised equivalent of hyperparameter tuning.
    """
    print(f"  Running contamination sensitivity analysis...")
    sensitivity_results = {}

    for c in CONTAMINATION_VALUES:
        model       = IsolationForest(n_estimators=100, contamination=c, random_state=42)
        predictions = model.fit_predict(X)
        anomaly_count = int(np.sum(predictions == -1))
        anomaly_rate  = anomaly_count / len(predictions)
        sensitivity_results[str(c)] = {
            "anomaly_count": anomaly_count,
            "anomaly_rate":  round(anomaly_rate, 4),
            "expected_rate": c
        }
        print(f"    contamination={c:.2f} → {anomaly_count} anomalies ({anomaly_rate:.1%} of {len(predictions)} months)")

    # save sensitivity results
    with open(f"metrics/{dis_name}_sensitivity.json", "w") as f:
        json.dump(sensitivity_results, f, indent=2)

    # choose contamination where actual rate is closest to expected
    # good model: actual_rate ≈ contamination value
    best_c = BEST_CONTAMINATION
    best_diff = float("inf")
    for c in CONTAMINATION_VALUES:
        actual_rate = sensitivity_results[str(c)]["anomaly_rate"]
        diff = abs(actual_rate - c)
        if diff < best_diff:
            best_diff = best_c
            best_c    = c

    print(f"  → Selected contamination: {best_c}")
    return best_c


def compute_anomaly_scores(model: IsolationForest, X: pd.DataFrame, df_monthly: pd.DataFrame) -> dict:
    """
    Compute anomaly scores for all samples.
    Isolation Forest score_samples() returns negative values —
    more negative = more anomalous.
    This is the 'confidence' of the anomaly detection.
    """
    scores = model.score_samples(X)  # shape: (n_samples,)

    # normalise to 0-1 range for readability (0 = most anomalous, 1 = most normal)
    min_score = scores.min()
    max_score = scores.max()
    if max_score > min_score:
        normalised = (scores - min_score) / (max_score - min_score)
    else:
        normalised = np.ones_like(scores) * 0.5

    # feature contribution — which feature deviates most in anomalous months
    anomaly_mask = model.predict(X) == -1
    feature_deviations = {}

    if anomaly_mask.sum() > 0:
        normal_means   = X[~anomaly_mask].mean()
        anomaly_means  = X[anomaly_mask].mean()
        normal_stds    = X[~anomaly_mask].std().replace(0, 1)

        for col in FEATURE_COLS:
            deviation = abs(anomaly_means[col] - normal_means[col]) / normal_stds[col]
            feature_deviations[col] = round(float(deviation), 3)

    return {
        "mean_anomaly_score":     round(float(scores[anomaly_mask].mean()), 4) if anomaly_mask.sum() > 0 else None,
        "mean_normal_score":      round(float(scores[~anomaly_mask].mean()), 4),
        "score_separation":       round(float(scores[~anomaly_mask].mean() - scores[anomaly_mask].mean()), 4) if anomaly_mask.sum() > 0 else None,
        "feature_deviations":     feature_deviations,
        "most_anomalous_feature": max(feature_deviations, key=feature_deviations.get) if feature_deviations else None,
    }


def temporal_validation(df_monthly: pd.DataFrame, dis_name: str) -> dict:
    """
    Train on 2000-2020, predict on 2021-2025.
    Checks if the model generalises beyond its training window.
    This is the closest we can get to cross-validation without labels.
    """
    print(f"  Running temporal validation (train: 2000-2020, test: 2021-2025)...")

    train_df = df_monthly[df_monthly["year"] <= 2020]
    test_df  = df_monthly[df_monthly["year"] >= 2021]

    if len(train_df) < 12 or len(test_df) < 3:
        print(f"  ✗ Insufficient data for temporal validation")
        return {"error": "insufficient data"}

    X_train = train_df[FEATURE_COLS].values
    X_test  = test_df[FEATURE_COLS].values

    val_model       = IsolationForest(n_estimators=100, contamination=BEST_CONTAMINATION, random_state=42)
    val_model.fit(X_train)
    test_predictions = val_model.predict(X_test)

    anomaly_count = int(np.sum(test_predictions == -1))
    anomaly_rate  = anomaly_count / len(test_predictions)

    # flagged months in the test period
    test_df = test_df.copy()
    test_df["predicted"] = test_predictions
    flagged = test_df[test_df["predicted"] == -1][["year", "month", "rainfall", "temp_max"]].to_dict("records")

    print(f"  → Test period: {len(test_predictions)} months, {anomaly_count} anomalies ({anomaly_rate:.1%})")

    return {
        "train_samples":      len(X_train),
        "test_samples":       len(X_test),
        "test_anomaly_count": anomaly_count,
        "test_anomaly_rate":  round(anomaly_rate, 4),
        "flagged_months":     flagged
    }


def compute_seasonal_stats(df_monthly: pd.DataFrame) -> dict:
    """
    Compute per-month statistics — useful for understanding
    what the model considers 'normal' for each month.
    """
    stats = {}
    for month in range(1, 13):
        month_data = df_monthly[df_monthly["month"] == month]
        if len(month_data) == 0:
            continue
        stats[month] = {
            "mean_rainfall":  round(float(month_data["rainfall"].mean()), 1),
            "std_rainfall":   round(float(month_data["rainfall"].std()), 1),
            "mean_temp_max":  round(float(month_data["temp_max"].mean()), 1),
            "std_temp_max":   round(float(month_data["temp_max"].std()), 1),
            "sample_count":   len(month_data)
        }
    return stats


if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"AgriSense Weather Anomaly Model Training")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    overall_results = {}

    for dis_name, coords in DISTRICTS.items():
        print(f"\n{'─'*50}")
        print(f"Processing: {dis_name.upper()}")
        print(f"{'─'*50}")

        # ── skip if already trained ───────────────────────────
        if os.path.exists(f"models/{dis_name}_anomaly.pkl"):
            print(f"  Already trained — skipping {dis_name}")
            overall_results[dis_name] = {"status": "skipped"}
            continue

        
        df = fetch_historical_data(dis_name, coords)
        if df is None:
            overall_results[dis_name] = {"status": "failed", "reason": "data fetch failed"}
            continue

        
        df_monthly = aggregate_monthly(df)
        print(f"  Monthly records: {len(df_monthly)}")

        if len(df_monthly) < 24:
            print(f"  ✗ Insufficient monthly data ({len(df_monthly)} months) — skipping")
            overall_results[dis_name] = {"status": "failed", "reason": "insufficient data"}
            continue

        
        X = df_monthly[FEATURE_COLS].values

        
        best_contamination = contamination_sensitivity_analysis(X, dis_name)

        
        print(f"  Training final model (contamination={best_contamination})...")
        final_model = IsolationForest(
            n_estimators  = 100,
            contamination = best_contamination,
            random_state  = 42
        )
        final_model.fit(X)

        final_predictions = final_model.predict(X)
        total_anomalies   = int(np.sum(final_predictions == -1))
        anomaly_rate      = total_anomalies / len(final_predictions)

        print(f"  ✓ Final model: {total_anomalies}/{len(final_predictions)} months flagged ({anomaly_rate:.1%})")

        
        print(f"  Computing anomaly scores...")
        X_df         = df_monthly[FEATURE_COLS]
        score_metrics = compute_anomaly_scores(final_model, X_df, df_monthly)
        print(f"  → Score separation: {score_metrics['score_separation']}")
        print(f"  → Most anomalous feature: {score_metrics['most_anomalous_feature']}")

        
        val_results = temporal_validation(df_monthly, dis_name)

        
        seasonal_stats = compute_seasonal_stats(df_monthly)

        
        historical_avg = df_monthly.groupby("month")[FEATURE_COLS].mean()
        joblib.dump(historical_avg, f"models/{dis_name}_historical_avg.pkl")

       
        joblib.dump(final_model, f"models/{dis_name}_anomaly.pkl")

        
        metrics = {
            "district":              dis_name,
            "trained_at":            datetime.now().isoformat(),
            "total_monthly_records": len(df_monthly),
            "year_range":            f"{int(df_monthly['year'].min())}–{int(df_monthly['year'].max())}",
            "contamination_used":    best_contamination,
            "training_anomalies":    total_anomalies,
            "training_anomaly_rate": round(anomaly_rate, 4),
            "anomaly_scores":        score_metrics,
            "temporal_validation":   val_results,
            "seasonal_stats":        seasonal_stats,
        }

        with open(f"metrics/{dis_name}_metrics.json", "w") as f:
            json.dump(metrics, f, indent=2)

        overall_results[dis_name] = {
            "status":        "success",
            "monthly_records": len(df_monthly),
            "anomaly_rate":  round(anomaly_rate, 4),
            "score_sep":     score_metrics["score_separation"],
            "val_anomaly_rate": val_results.get("test_anomaly_rate", "N/A")
        }

        print(f"  ✓ Saved models/{dis_name}_anomaly.pkl")
        print(f"  ✓ Saved metrics/{dis_name}_metrics.json")

        
        print(f"  Waiting 3s before next district...")
        time.sleep(3)

    # ── final summary report 
    print(f"\n{'='*60}")
    print(f"TRAINING COMPLETE — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

    success = [d for d, r in overall_results.items() if r.get("status") == "success"]
    failed  = [d for d, r in overall_results.items() if r.get("status") == "failed"]
    skipped = [d for d, r in overall_results.items() if r.get("status") == "skipped"]

    print(f"\n✓ Trained:  {len(success)} districts")
    print(f"✗ Failed:   {len(failed)} districts {failed if failed else ''}")
    print(f"⟳ Skipped:  {len(skipped)} districts (already trained)")

    if success:
        print(f"\nDistrict Results:")
        print(f"{'District':<15} {'Records':<10} {'Anomaly Rate':<15} {'Score Sep':<12} {'Val Rate'}")
        print(f"{'─'*65}")
        for d in success:
            r = overall_results[d]
            print(f"{d:<15} {r['monthly_records']:<10} {r['anomaly_rate']:<15.1%} {str(r['score_sep']):<12} {r['val_anomaly_rate']}")

    
    with open("metrics/training_summary.json", "w") as f:
        json.dump({
            "completed_at": datetime.now().isoformat(),
            "results":      overall_results
        }, f, indent=2)

    print(f"\n✓ Full metrics saved to metrics/")