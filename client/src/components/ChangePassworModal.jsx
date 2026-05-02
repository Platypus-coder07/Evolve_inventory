import { useState } from "react";
import { X, Lock, Key } from "lucide-react";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to change password.");
      }

      setSuccess("Password changed successfully!");
      setTimeout(() => {
        handleClose();
      }, 2000); // Close automatically after showing success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#00C951]" />
            <h2 className="text-lg font-semibold text-white">
              Change Password
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
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              required
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full px-4 py-2.5 text-sm bg-[#00C951] text-black font-semibold rounded-lg hover:bg-[#00b348] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
