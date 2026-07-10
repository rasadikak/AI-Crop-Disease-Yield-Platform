import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { farmer, token, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  

// list of paths where navbar should NOT appear
  const hideOnPaths = ["/","/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

// return nothing if we're on an auth page
  if (hideOnPaths.includes(location.pathname)) return null;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    setMenuOpen(false);
  };

  // highlights the active page link
  const isActive = (path: string) =>
    location.pathname === path
      ? "text-white font-semibold border-b-2 border-green-300"
      : "text-green-100 hover:text-white transition-colors";

  return (
    <nav className="bg-green-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* logo */}
        <Link to={token ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-white font-bold text-lg tracking-tight">AgriSense</span>
        </Link>

        {/* desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {token ? (
            <>
              <Link to="/dashboard"  className={isActive("/dashboard")}>Dashboard</Link>
              <Link to="/scan"       className={isActive("/scan")}>Disease Scan</Link>
              <Link to="/yield"      className={isActive("/yield")}>Yield Predictor</Link>
              <Link to="/weather"    className={isActive("/weather")}>Weather</Link>
              <Link to="/chatbot"    className={isActive("/chatbot")}>AI Chat</Link>

              {/* profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-green-100 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {farmer?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{farmer?.name?.split(" ")[0]}</span>
                  <span className="text-xs">▾</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                    >
                      👤 My Profile
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"  className="text-green-100 hover:text-white transition-colors text-sm">Sign In</Link>
              <Link
                to="/signup"
                className="bg-white text-green-800 hover:bg-green-50 font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* mobile hamburger */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 px-4 pb-4 space-y-2">
          {token ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm hover:text-white">Dashboard</Link>
              <Link to="/scan"      onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm hover:text-white">Disease Scan</Link>
              <Link to="/yield"     onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm hover:text-white">Yield Predictor</Link>
              <Link to="/weather"   onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm hover:text-white">Weather</Link>
              <Link to="/chatbot"   onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm hover:text-white">AI Chat</Link>
              <Link to="/profile"   onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm hover:text-white">My Profile</Link>
              <button onClick={handleLogout} className="block text-red-400 py-2 text-sm hover:text-red-300 w-full text-left">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm">Sign In</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="block text-green-100 py-2 text-sm">Create Account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;