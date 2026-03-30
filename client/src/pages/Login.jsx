import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User as UserIcon, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isRegistering
      ? "/api/v1/user/register"
      : "/api/v1/user/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegistering
            ? formData
            : { email: formData.email, password: formData.password },
        ),
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Authentication failed");
      }

      if (isRegistering) {
        setIsRegistering(false);
        setError("Registration successful! Please log in.");
        setFormData({ ...formData, name: "", password: "" });
      } else {
        login(json.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-screen overflow-y-auto custom-scrollbar">
        <div className="text-center mb-6 sm:mb-8 mt-2 sm:mt-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00C951]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#00C951]/20">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#00C951]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {isRegistering ? "Create Account" : "Welcome to Evolve Lab"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            {isRegistering
              ? "Register to access the inventory"
              : "Sign in to manage inventory"}
          </p>
        </div>

        {error && (
          <div
            className={`p-3 sm:p-4 mb-5 sm:mb-6 text-xs sm:text-sm rounded-lg flex items-center gap-3 ${
              error.includes("successful")
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            {!error.includes("successful") && (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          {isRegistering && (
            <div>
              <label className="block text-[10px] sm:text-xs text-gray-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-white focus:border-[#00C951] outline-none transition-all placeholder-gray-600 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] sm:text-xs text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-white focus:border-[#00C951] outline-none transition-all placeholder-gray-600 text-sm"
                placeholder="manager@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-white focus:border-[#00C951] outline-none transition-all placeholder-gray-600 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#00C951] text-black font-semibold rounded-lg py-2.5 hover:bg-[#00b348] transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? "Processing..." : isRegistering ? "Register" : "Sign In"}
          </button>
        </form>

        <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-400 border-t border-gray-800 pt-5 sm:pt-6 mb-2 sm:mb-0">
          {isRegistering ? "Already have an account?" : "Need lab access?"}{" "}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="text-[#00C951] hover:underline focus:outline-none"
          >
            {isRegistering ? "Sign in here" : "Register here"}
          </button>
        </div>
      </div>
    </div>
  );
}
