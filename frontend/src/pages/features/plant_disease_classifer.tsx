import { useState, useRef } from "react";
import api from "../../services/api";

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  mild:     { label: "Mild",     color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-500"  },
  moderate: { label: "Moderate", color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-500"  },
  severe:   { label: "Severe",   color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500"    },
};

type DiseaseFacts = {
  display_name: string;
  cause: string;
  organic_treatment: string[];
  chemical_treatment: string[];
  prevention: string[];
  severity: string;
};

type DiseaseResult = {
  disease: string;
  severity: string;
  facts: DiseaseFacts;
  explanation: string;
  is_known_disease: boolean;
};

const PlantDiseaseClassifierPage = () => {
  const [file, setFile]           = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage]         = useState<"idle" | "predicting" | "fetching_treatment">("idle");
  const [error, setError]         = useState("");
  const [result, setResult]       = useState<DiseaseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = stage === "predicting" || stage === "fetching_treatment";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError("");
    setResult(null);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select a leaf photo to upload");
      return;
    }

    try {
      
      setStage("predicting");
      const formData = new FormData();
      formData.append("image", file);

      
      const predictRes = await api.post("/plant_disease/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const diseaseName = predictRes.data.disease;

     
      setStage("fetching_treatment");

      
      const treatmentRes = await api.post("/treatment/", {
        disease: diseaseName,
      });

      setResult(treatmentRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong — please try again");
    } finally {
      setStage("idle");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const severityInfo = result
    ? SEVERITY_CONFIG[result.severity] ?? SEVERITY_CONFIG["moderate"]
    : null;

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-green-900 mb-1">
            Plant Disease Classifier
          </h1>
          <p className="text-gray-600 text-sm">
            Upload a clear photo of a leaf to detect diseases and get treatment recommendations
          </p>
        </div>

        {/* upload card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leaf photo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="leaf-upload"
              />

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Selected leaf"
                    className="w-full h-56 sm:h-64 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="leaf-upload"
                  className="flex flex-col items-center justify-center w-full h-56 sm:h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-colors"
                >
                  <div className="text-4xl mb-2">🍃</div>
                  <p className="text-sm font-medium text-gray-600">Tap to upload a leaf photo</p>
                  <p className="text-xs text-gray-400 mt-1">Clear, well-lit, close-up shots work best</p>
                </label>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {stage === "predicting" && (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analysing leaf...
                </span>
              )}
              {stage === "fetching_treatment" && (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Fetching treatment advice...
                </span>
              )}
              {stage === "idle" && "Scan Leaf"}
            </button>
          </form>
        </div>

        {/* results */}
        {result && (
          <div className="space-y-4">

            {/* disease + severity header */}
            <div className={`${severityInfo!.bg} border ${severityInfo!.border} rounded-2xl p-5`}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Detected Disease</p>
                  <h2 className="text-lg font-bold text-gray-800">
                    {result.facts?.display_name ?? result.disease}
                  </h2>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${severityInfo!.color} bg-white/70 flex-shrink-0`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${severityInfo!.dot}`} />
                  {severityInfo!.label}
                </span>
              </div>
              {!result.is_known_disease && (
                <p className="text-xs text-amber-700 mt-2">
                  ⚠️ This disease isn't in our known database — recommendations below are general guidance only.
                </p>
              )}
            </div>

            {/* cause */}
            {result.facts?.cause && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Cause</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.facts.cause}</p>
              </div>
            )}

            {/* treatments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.facts?.organic_treatment?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                    🌿 Organic Treatment
                  </p>
                  <ul className="space-y-1.5">
                    {result.facts.organic_treatment.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                        <span className="text-green-600 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.facts?.chemical_treatment?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-2">
                    🧪 Chemical Treatment
                  </p>
                  <ul className="space-y-1.5">
                    {result.facts.chemical_treatment.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                        <span className="text-sky-600 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* prevention */}
            {result.facts?.prevention?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  🛡️ Prevention
                </p>
                <ul className="space-y-1.5">
                  {result.facts.prevention.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* full explanation */}
            {result.explanation && (
              <div className="bg-green-800 rounded-2xl p-5 text-white">
                <p className="text-xs text-green-300 uppercase tracking-wide mb-2">💬 AI Summary</p>
                <p className="text-sm leading-relaxed text-green-100 whitespace-pre-line">
                  {result.explanation.replace(/\*\*/g, "")}
                </p>
              </div>
            )}

            {/* context note */}
            <p className="text-xs text-gray-500 text-center">
              AI-generated guidance. Consult your local Agriculture Extension Office for region-specific advice.
            </p>

            {/* scan another */}
            <button
              onClick={handleReset}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors border border-gray-200"
            >
              🔄 Scan Another Leaf
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default PlantDiseaseClassifierPage;