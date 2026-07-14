import { useState } from "react";
import api from "../../services/api";

const CROPS = [
  "Cassava", "Maize", "Plantains and others", "Potatoes",
  "Rice, paddy", "Sorghum", "Soybeans", "Sweet potatoes"
];


const ConfidenceBar = ({
  value, low, high
}: { value: number; low: number; high: number }) => {
  const range    = high - low;
  const position = range > 0 ? ((value - low) / range) * 100 : 50;
  const clampedPos = Math.min(Math.max(position, 5), 95);

  const confidenceLevel = range < 500
    ? { label: "High confidence", color: "bg-green-500" }
    : range < 1000
    ? { label: "Moderate confidence", color: "bg-yellow-400" }
    : { label: "Lower confidence",  color: "bg-orange-400" };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">

      {/* main prediction */}
      <div className="text-center mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Predicted Yield
        </p>
        <p className="text-4xl font-bold text-green-800">
          {value.toLocaleString()}
          <span className="text-lg font-normal text-gray-400 ml-1">kg/ha</span>
        </p>
      </div>

      {/* range bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Low estimate</span>
          <span>High estimate</span>
        </div>

        <div className="relative h-3 bg-gray-100 rounded-full">
          <div className="absolute inset-0 bg-green-100 rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-green-700 rounded-full shadow-md border-2 border-white z-10"
            style={{ left: `calc(${clampedPos}% - 10px)` }}
          />
        </div>

        <div className="flex justify-between text-xs font-medium text-gray-500 mt-1.5">
          <span>{low.toLocaleString()} kg/ha</span>
          <span>{high.toLocaleString()} kg/ha</span>
        </div>
      </div>

      {/* confidence indicator */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${confidenceLevel.color}`} />
        <p className="text-xs text-gray-400">{confidenceLevel.label} — prediction range: {range.toLocaleString()} kg/ha</p>
      </div>
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────
const CropYieldPredictorPage = () => {
  const [crop, setCrop]           = useState("");
  const [year, setYear]           = useState("");
  const [temp, setTemp]           = useState("");
  const [pesticides, setPesticides] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState<any>(null);

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!crop || !year || !temp || !pesticides) {
      setError("All fields are required"); return;
    }

    const yearNum       = Number(year);
    const tempNum       = Number(temp);
    const pesticidesNum = Number(pesticides);

    if (!Number.isFinite(yearNum) || yearNum < 2000 || yearNum > currentYear + 10) {
      setError(`Year must be between 2000 and ${currentYear + 10}`); return;
    }
    if (!Number.isFinite(tempNum) || tempNum < -20 || tempNum > 55) {
      setError("Temperature must be between -20°C and 55°C"); return;
    }
    if (!Number.isFinite(pesticidesNum) || pesticidesNum < 0) {
      setError("Pesticides must be a positive number"); return;
    }

    setIsLoading(true);
    try {
      console.log("hiiii");
      const res = await api.post("/crop_yield_predictor/", {
        crop, year: yearNum, temp: tempNum, pesticides: pesticidesNum
      });
      console.log(res);
      setResult(res.data);
    } catch (err: any) {
      console.log("errrrrrrr",err)
      setError(err.response?.data?.error || "Prediction failed — please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-900">Crop Yield Predictor</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your crop details to get an estimated yield prediction
          </p>
        </div>

        {/* form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* crop */}
            <div>
              <label className={labelClass}>Crop Type</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a crop</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* year + temp side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Year</label>
                <input
                  type="number"
                  value={year}
                  placeholder={String(currentYear)}
                  min={2000}
                  max={currentYear + 10}
                  step={1}
                  onChange={(e) => setYear(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Avg. Temperature (°C)</label>
                <input
                  type="number"
                  value={temp}
                  placeholder="27.5"
                  min={-20}
                  max={55}
                  step={0.1}
                  onChange={(e) => setTemp(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* pesticides */}
            <div>
              <label className={labelClass}>Pesticides Used (tonnes)</label>
              <input
                type="number"
                value={pesticides}
                placeholder="100"
                min={0}
                step={0.01}
                onChange={(e) => setPesticides(e.target.value)}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">
                Total pesticide usage in tonnes for the region/season
              </p>
            </div>

            {/* error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Calculating...
                </span>
              ) : "Predict Yield"}
            </button>

          </form>
        </div>

        {/* result */}
        {result && (
          <div>
            <h2 className="text-lg font-semibold text-green-900 mb-3">Prediction Result</h2>
            <ConfidenceBar
              value={result.predicted_yield_kg_per_ha}
              low={result.confidence_low}
              high={result.confidence_high}
            />

            {/* context note */}
            <p className="text-xs text-gray-400 mt-3 text-center">
              Based on FAO global agricultural data. Consult your local Agriculture Extension Office for region-specific guidance.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CropYieldPredictorPage;