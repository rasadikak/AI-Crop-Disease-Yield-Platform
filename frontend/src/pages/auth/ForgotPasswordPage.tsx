import { useState } from "react";
import { forgotPassword } from "../../services/authService";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email address is required"); return; }
    setIsLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const sharedWrapper = (children: React.ReactNode) => (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/forgetPasswordPage.webp')" }}
    >
      <div className="absolute inset-0 bg-white/15" />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="text-2xl font-bold text-green-800">AgriSense</h1>
        </div>
        {children}
      </div>
    </div>
  );

  if (sent) return sharedWrapper(
    <>
      <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
        ✓ Reset link sent to <strong>{email}</strong>. Check your inbox.
      </div>
      <p className="text-gray-500 text-sm text-center">Didn't receive it? Check your spam folder.</p>
      <div className="text-center mt-4">
        <Link to="/login" className="text-green-700 text-sm font-medium hover:underline">
          Back to Sign In
        </Link>
      </div>
    </>
  );

  return sharedWrapper(
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Reset your password</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter your email and we'll send you a reset link.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
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
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link to="/login" className="text-green-700 text-sm font-medium hover:underline">
          Back to Sign In
        </Link>
      </div>
    </>
  );
};

export default ForgotPasswordPage;