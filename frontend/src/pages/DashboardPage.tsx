// ─── DashboardPage.tsx ────────────────────────────────────────────────────────
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ChatbotPage from "./features/chatbot";

const QUICK_ACTIONS = [
  { icon: "🔬", title: "Scan a Leaf",     description: "Detect crop diseases from a photo", to: "/scan",    color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { icon: "📊", title: "Predict Yield",   description: "Estimate your harvest yield",        to: "/yield",   color: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
  { icon: "🌦️", title: "Weather Alerts",  description: "Check anomalies in your district",   to: "/weather", color: "bg-sky-50 border-sky-200 hover:bg-sky-100" },
];

const DashboardPage = () => {
  const { farmer } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const isMaha = !(new Date().getMonth() >= 3 && new Date().getMonth() <= 8);

  return (
    <div className="min-h-screen bg-amber-50">

      {/* hero banner */}
      <div
        className="relative bg-cover bg-center py-10"
        style={{ backgroundImage: "url('/images/rice-field.jpg')" }}
      >
        <div className="absolute inset-0 bg-green-900/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="text-green-300 text-sm mb-1">{greeting()},</p>
          <h1 className="text-3xl font-bold text-white mb-1">{farmer?.name ?? "Farmer"}</h1>
          {farmer?.district && (
            <p className="text-green-200 text-sm">📍 {farmer.district} District</p>
          )}
        </div>
      </div>

      {/* main layout — left content + right chatbot */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6 items-start">

        {/* ── left column ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* quick actions */}
          <div>
            <h2 className="text-base font-semibold text-green-900 mb-3">What would you like to do?</h2>
            <div className="grid grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className={`${action.color} border rounded-2xl p-4 transition-colors`}
                >
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">{action.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* info cards */}
          <div className="grid grid-cols-3 gap-3">

            {/* district */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Your District</p>
              <p className="text-xl font-bold text-green-800 truncate">
                {farmer?.district ?? "Not set"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Used for weather & regional advice</p>
              {!farmer?.district && (
                <Link to="/profile" className="text-xs text-green-700 hover:underline mt-2 inline-block">
                  Set district →
                </Link>
              )}
            </div>

            {/* season */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Current Season</p>
              <p className="text-xl font-bold text-amber-700">{isMaha ? "Maha" : "Yala"}</p>
              <p className="text-xs text-gray-400 mt-1">
                {isMaha ? "Oct – Mar · Major season" : "Apr – Sep · Minor season"}
              </p>
            </div>

            {/* account */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Account</p>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${farmer?.isVerified ? "bg-green-500" : "bg-yellow-400"}`} />
                <p className="text-sm font-semibold text-gray-800">
                  {farmer?.isVerified ? "Verified" : "Unverified"}
                </p>
              </div>
              <p className="text-xs text-gray-400 truncate">{farmer?.email}</p>
              {!farmer?.isVerified && (
                <Link to="/verify-email" className="text-xs text-green-700 hover:underline mt-2 inline-block">
                  Verify email →
                </Link>
              )}
            </div>
          </div>

          {/* seasonal tip */}
          <div className="bg-green-800 rounded-2xl p-5 text-white">
            <p className="text-xs text-green-300 uppercase tracking-wide mb-2">💡 Seasonal Tip</p>
            <p className="text-sm leading-relaxed text-green-100">
              {isMaha
                ? "Maha season brings heavy rainfall — watch for fungal diseases like blight and ensure proper drainage in your fields."
                : "Yala season is drier — ensure adequate irrigation for your crops and monitor for heat stress in high-temperature periods."}
            </p>
          </div>

        </div>

        {/* ── right column — chatbot ── */}
        <div className="w-80 flex-shrink-0 sticky top-4" style={{ height: "calc(100vh - 120px)" }}>
          <ChatbotPage />
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;