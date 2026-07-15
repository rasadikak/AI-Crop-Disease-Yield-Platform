import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🔬",
    title: "Disease Detection",
    description: "Upload a leaf photo and get instant AI diagnosis with treatment recommendations"
  },
  {
    icon: "📊",
    title: "Yield Prediction",
    description: "Predict your crop yield using machine learning trained on agricultural data"
  },
  {
    icon: "🌦️",
    title: "Weather Alerts",
    description: "Get early warnings about unusual weather patterns before they damage your crops"
  },
  {
    icon: "🤖",
    title: "AI Farming Assistant",
    description: "Ask any farming question and get instant answers powered by AI"
  }
];

const HomePage = () => {
  return (
    <div className="min-h-screen">

      {/* hero section */}
      <div
        className="relative min-h-screen bg-cover bg-center flex items-center"
        style={{ backgroundImage: "url('/images/cropYieldPredPage.webp')" }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-white">
          <div className="text-4xl sm:text-5xl mb-4">🌿</div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
            Smart Farming<br />
            <span className="text-green-400">Starts Here</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-200 mb-8 max-w-xl">
            AI-powered crop disease detection, yield prediction, and weather alerts — built for Sri Lankan farmers.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              to="/signup"
              className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl border border-white/30 transition-colors text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs flex flex-col items-center gap-1">
          <span>Scroll to learn more</span>
          <span>↓</span>
        </div>
      </div>

      {/* features section */}
      <div
        className="relative py-14 sm:py-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/homePage2.webp')" 
            
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">What AgriSense Can Do</h2>
            <p className="text-gray-300 text-sm max-w-xl mx-auto">
              Four AI-powered tools built specifically for Sri Lankan crops and growing conditions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div
        className="relative py-16 sm:py-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/homePage3.webp')" }}
      >
        <div className="absolute inset-0 bg-green-900/50" />
        <div className="relative z-10 text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to farm smarter?
          </h2>
          <p className="text-green-200 text-sm mb-8 max-w-md mx-auto">
            Join farmers across Sri Lanka using AI to protect their crops and improve their yields.
          </p>
          <Link
            to="/signup"
            className="bg-white text-green-800 hover:bg-green-50 font-semibold px-10 py-3 rounded-xl transition-colors text-sm inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* footer */}
      <div className="bg-green-950 text-green-400 text-center text-xs py-6">
        © 2026 AgriSense · Built for Sri Lankan Farmers
      </div>

    </div>
  );
};

export default HomePage;