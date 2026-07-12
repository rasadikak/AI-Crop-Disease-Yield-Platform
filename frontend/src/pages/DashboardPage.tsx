import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ChatbotPage from "./features/chatbot";

const QUICK_ACTIONS = [
  {
    icon: "🔬",
    title: "Scan a Leaf",
    description: "Detect crop diseases from a photo",
    to: "/scan",
    color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
  },
  {
    icon: "📊",
    title: "Predict Yield",
    description: "Estimate your harvest yield",
    to: "/yield",
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100"
  },
  {
    icon: "🌦️",
    title: "Weather Alerts",
    description: "Check anomalies in your district",
    to: "/weather",
    color: "bg-sky-50 border-sky-200 hover:bg-sky-100"
  },
  {
    icon: "🤖",
    title: "AI Assistant",
    description: "Ask any farming question",
    to: "/chatbot",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
  }
];

const DashboardPage = () => {
  const { farmer } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* hero banner */}
      <div
        className="relative bg-cover bg-center py-12"
        style={{ backgroundImage: "url('/images/rice-field.jpg')" }}
      >
        <div className="absolute inset-0 bg-green-900/70" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <p className="text-green-300 text-sm mb-1">{greeting()},</p>
          <h1 className="text-3xl font-bold text-white mb-1">
            {farmer?.name ?? "Farmer"}
          </h1>
          {farmer?.district && (
            <p className="text-green-200 text-sm flex items-center gap-1">
              📍 {farmer.district} District
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* quick actions */}
        <h2 className="text-lg font-semibold text-green-900 mb-4">What would you like to do?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className={`${action.color} border rounded-2xl p-4 transition-colors group`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <p className="font-semibold text-gray-800 text-sm mb-1">{action.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* info cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* district info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Your District</p>
            <p className="text-2xl font-bold text-green-800">
              {farmer?.district ?? "Not set"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Used for weather alerts and regional advice</p>
            {!farmer?.district && (
              <Link to="/profile" className="text-xs text-green-700 hover:underline mt-2 inline-block">
                Set your district →
              </Link>
            )}
          </div>

          {/* current season */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Current Season</p>
            <p className="text-2xl font-bold text-amber-700">
              {new Date().getMonth() >= 3 && new Date().getMonth() <= 8 ? "Yala" : "Maha"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date().getMonth() >= 3 && new Date().getMonth() <= 8
                ? "April – September · Minor season"
                : "October – March · Major season"}
            </p>
          </div>

          {/* account status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Account</p>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${farmer?.isVerified ? "bg-green-500" : "bg-yellow-400"}`} />
              <p className="text-sm font-semibold text-gray-800">
                {farmer?.isVerified ? "Verified" : "Not verified"}
              </p>
            </div>
            <p className="text-xs text-gray-400">{farmer?.email}</p>
            {!farmer?.isVerified && (
              <Link to="/verify-email" className="text-xs text-green-700 hover:underline mt-2 inline-block">
                Verify your email →
              </Link>
            )}
          </div>
        </div>

        {/* tips section */}
        <div className="bg-green-800 rounded-2xl p-6 text-white">
          <p className="text-xs text-green-300 uppercase tracking-wide mb-2">💡 Farming Tip</p>
          <p className="text-sm leading-relaxed text-green-100">
            {new Date().getMonth() >= 3 && new Date().getMonth() <= 8
              ? "Yala season is drier — ensure adequate irrigation for your crops and monitor for heat stress in high-temperature periods."
              : "Maha season brings heavy rainfall — watch for fungal diseases like blight and ensure proper drainage in your fields."}
          </p>
        </div>

      </div>

      {/* floating chat widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatbotPage />
      </div>
    </div>
  );
};

export default DashboardPage;