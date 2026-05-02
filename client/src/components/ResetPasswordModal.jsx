import { useState } from "react";
import { X, Key } from "lucide-react";

export default function ResetPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to reset user password.");
      }
      const newPassword = json.data.password; // Get the new password from the response
      setSuccess(
        `Success! The password for ${email} has been reset to: "${newPassword}" .`,
      );
      setEmail(""); // Clear the input on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">
              Reset User Password
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-xs text-gray-400">
            This will immediately overwrite the user's current password and set
            it to the default system password.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-[#00C951]/10 border border-[#00C951]/20 text-[#00C951] text-sm rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              User Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all text-sm"
              placeholder="user@example.com"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Force Reset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
