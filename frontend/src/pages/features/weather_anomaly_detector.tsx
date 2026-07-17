import useAuth from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ALERT_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string; border: string }> = {
  drought:        { icon: "🏜️", label: "Drought",         color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" },
  flood_risk:     { icon: "🌊", label: "Flood Risk",      color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"   },
  heat_spike:     { icon: "🌡️", label: "Heat Spike",      color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200"    },
  cold_spell:     { icon: "❄️", label: "Cold Spell",      color: "text-sky-700",    bg: "bg-sky-50",     border: "border-sky-200"    },
  unusual_weather:{ icon: "⚠️", label: "Unusual Weather", color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200" },
};

const WeatherAnomalyDetectorPage = () => {
  const { farmer }        = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState<any>(null);

  const currentMonth = MONTH_NAMES[new Date().getMonth()];
  const currentYear  = new Date().getFullYear();
  const district     = farmer?.district;

  // auto-fetch when page loads or district changes
  useEffect(() => {
    if (!district) return;

    const fetchAnomalies = async () => {
      setIsLoading(true);
      setError("");
      setResult(null);

      try {
        const res = await api.post("/weather_anomaly/", {
                district:district
            })
        setResult(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Weather anomaly detection failed — please try again");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnomalies();
  }, [district]);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/weatherAnomalyPage.webp')" }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Weather Anomaly Detector</h1>
          <p className="text-green-200 text-sm">
            {currentMonth} {currentYear} · {district ?? "No district set"}
          </p>
        </div>

        {/* no district set */}
        {!district && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-amber-800 font-medium text-sm mb-1">⚠️ No district set</p>
            <p className="text-amber-600 text-xs mb-3">
              Set your district in your profile to see weather anomaly alerts for your area.
            </p>
            <Link
              to="/profile"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors inline-block"
            >
              Set district in Profile
            </Link>
          </div>
        )}

        {/* loading */}
        {isLoading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3 animate-pulse">🌦️</div>
            <p className="text-gray-600 text-sm font-medium">Analysing weather patterns...</p>
            <p className="text-gray-400 text-xs mt-1">Checking last 90 days for {district}</p>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="text-red-700 text-sm font-medium mb-1">⚠️ {error}</p>
            <button
              onClick={() => {
                if (district) {
                  setError("");
                  setIsLoading(true);
                  api.post("/weather_anomaly/", { district: district })
                    .then(res => setResult(res.data))
                    .catch(err => setError(err.response?.data?.error || "Failed"))
                    .finally(() => setIsLoading(false));
                }
              }}
              className="text-red-600 text-xs underline mt-1"
            >
              Try again
            </button>
          </div>
        )}

        {/* results */}
        {result && !isLoading && (
          <div className="space-y-4">

            {/* summary card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Analysis Summary</p>
                  <p className="font-semibold text-gray-800">
                    {district} District · Last 120 days
                  </p>
                </div>
                <div className={`text-3xl ${result.is_anomaly ? "" : ""}`}>
                  {result.is_anomaly ? "⚠️" : "✅"}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Months checked</p>
                  <p className="text-xl font-bold text-gray-700">{result.checked_months}</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${result.anomalous_months > 0 ? "bg-red-50" : "bg-green-50"}`}>
                  <p className="text-xs text-gray-400 mb-1">Anomalies found</p>
                  <p className={`text-xl font-bold ${result.anomalous_months > 0 ? "text-red-600" : "text-green-600"}`}>
                    {result.anomalous_months}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className={`text-sm font-bold ${result.is_anomaly ? "text-red-600" : "text-green-600"}`}>
                    {result.is_anomaly ? "Alert" : "Normal"}
                  </p>
                </div>
              </div>
            </div>

            {/* no anomalies */}
            {!result.is_anomaly && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">🌿</div>
                <p className="text-green-800 font-semibold text-sm mb-1">
                  No weather anomalies detected
                </p>
                <p className="text-green-600 text-xs">
                  Weather in {district} has been within normal ranges over the last 90 days.
                </p>
              </div>
            )}

            {/* alert cards */}
            {result.is_anomaly && result.alerts?.length > 0 && (
              <div className="space-y-3">
                <p className="text-white text-sm font-medium">
                  ⚠️ {result.alerts.length} anomal{result.alerts.length === 1 ? "y" : "ies"} detected
                </p>

                {result.alerts.map((alert: any, index: number) => {
                  const config = ALERT_CONFIG[alert.type] ?? ALERT_CONFIG["unusual_weather"];
                  return (
                    <div
                      key={index}
                      className={`${config.bg} border ${config.border} rounded-2xl p-5`}
                    >
                      {/* alert header */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl flex-shrink-0">{config.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-gray-400">· {alert.month}</span>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed">{alert.message}</p>
                        </div>
                      </div>

                      {/* alert stats */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-white/60 rounded-xl p-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">🌧️ Rainfall</p>
                          <p className="text-sm font-semibold text-gray-700">{alert.rainfall_mm} mm</p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">🌡️ Avg Temp</p>
                          <p className="text-sm font-semibold text-gray-700">{alert.avg_temp}°C</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* farming advice based on alerts */}
            {result.is_anomaly && (
              <div className="bg-green-800/90 backdrop-blur-sm rounded-2xl p-5 text-white">
                <p className="text-xs text-green-300 uppercase tracking-wide mb-2">
                  💡 Farming Advice
                </p>
                <p className="text-sm leading-relaxed text-green-100">
                  {result.alerts?.some((a: any) => a.type === "drought")
                    ? "Drought conditions detected — prioritise irrigation and consider drought-resistant crop varieties. Mulching can help retain soil moisture."
                    : result.alerts?.some((a: any) => a.type === "flood_risk")
                    ? "Excess rainfall detected — ensure proper field drainage and monitor crops for root rot and fungal diseases like blight."
                    : result.alerts?.some((a: any) => a.type === "heat_spike")
                    ? "Heat spike detected — increase irrigation frequency and consider shade nets for sensitive crops. Harvest early if crops are near maturity."
                    : result.alerts?.some((a: any) => a.type === "cold_spell")
                    ? "Cold spell detected — protect seedlings with cover and delay transplanting until temperatures normalise."
                    : "Unusual weather detected — monitor your crops closely and consult your local Agriculture Extension Office."}
                </p>
              </div>
            )}

            {/* refresh button */}
            <button
              onClick={() => {
                if (district) {
                  setIsLoading(true);
                  setResult(null);
                  api.post("/weather_anomaly/", { district: district })
                    .then(res => setResult(res.data))
                    .catch(err => setError(err.response?.data?.error || "Failed"))
                    .finally(() => setIsLoading(false));
                }
              }}
              className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2.5 rounded-xl transition-colors border border-white/30"
            >
              🔄 Refresh Analysis
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default WeatherAnomalyDetectorPage;