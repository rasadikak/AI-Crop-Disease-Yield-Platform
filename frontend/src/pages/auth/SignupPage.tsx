import { useState } from "react";
import { register } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string): string | null => {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Must contain a number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "Must contain a special character";
  return null;
};

const SignupPage = () => {
  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict]           = useState("");
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register({ name, email, password, district });
      navigate("/verify-email", { state: { email } });
    } catch (error: any) {
      setError(error.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center py-8"
      style={{ backgroundImage: "url('/images/leaves-bg.jpg')" }}
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8">

        {/* logo / title */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="text-2xl font-bold text-green-800">AgriSense</h1>
          <p className="text-gray-500 text-sm mt-1">Create your farmer account</p>
        </div>

        {/* error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              placeholder="Kamal Perera"
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              placeholder="kamal@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Min 6 chars, uppercase, number, symbol"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              placeholder="Re-enter your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* district */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">Select your district</option>
              {SRI_LANKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        {/* login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
        

      </div>
    </div>
  );
};

export default SignupPage;