// ─── LoginPage.tsx ───────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const LoginPage = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");
  const [showVerifyLink, setShowVerifyLink] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const successMsg = searchParams.get("success");
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required"); return; }
    setIsLoading(true);
    setError("");
    setShowVerifyLink(false);
    try {
      const response = await login({ email, password });
      loginUser(response);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
      if (err.response?.status === 403) setShowVerifyLink(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/leaves-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-8">
        {/* header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="text-2xl font-bold text-green-800">AgriSense</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* success messages */}
        {successMsg === "email_verified" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            ✓ Email verified successfully. You can now log in.
          </div>
        )}
        {successMsg === "password_updated" && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
            ✓ Password updated. Please log in with your new password.
          </div>
        )}

        {/* error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
            {showVerifyLink && (
              <div className="mt-2">
                <Link to="/verify-email" className="underline font-medium">
                  Verify your email here
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              placeholder="kamal@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-green-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-700 font-medium hover:underline">
              Create one
            </Link>
          </p>
          <p>
            Didn't verify your email?{" "}
            <Link to="/verify-email" className="text-green-700 font-medium hover:underline">
              Verify here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;