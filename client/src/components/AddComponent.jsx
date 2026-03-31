import { useState } from "react";
import { X, ChevronDown, Upload } from "lucide-react";

export default function AddComponentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    category: "",
    description: "",
    remark: "",
    component_working: 0,
    component_not_working: 0,
    component_in_use: 0,
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    setError("");

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    data.append("cloud_name", cloudName);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );

      const uploadedImage = await res.json();

      if (uploadedImage.secure_url) {
        setFormData((prev) => ({ ...prev, image: uploadedImage.secure_url }));
      } else {
        throw new Error("Failed to upload image to Cloudinary");
      }
    } catch (err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError("Please upload an image before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/component/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to create component");
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      image: "",
      category: "",
      description: "",
      remark: "",
      component_working: 0,
      component_not_working: 0,
      component_in_use: 0,
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-800 flex justify-between items-center shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Add New Component
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:gap-5"
          >
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Name *
                </label>
                <input
                  name="name"
                  required
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all placeholder-gray-600 text-sm"
                  placeholder="e.g. ESP32 Microcontroller"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Category *
                </label>
                <div className="relative">
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all text-sm appearance-none pr-10 cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Select Category...
                    </option>
                    <option value="micro_controller">Micro Controller</option>
                    <option value="sensor">Sensor</option>
                    <option value="actuator">Actuator</option>
                    <option value="motor_driver">Motor Driver</option>
                    <option value="power_supplies">Power Supplies</option>
                    <option value="communication">Communication</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Component Image *
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-[#121212] border border-gray-700 rounded-lg p-2.5">
                <label className="flex items-center justify-center w-full sm:w-auto bg-[#1A1A1A] border border-gray-600 hover:border-[#00C951] text-gray-300 hover:text-[#00C951] transition-colors rounded-md px-3 py-1.5 cursor-pointer text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 text-sm text-gray-500 truncate w-full sm:w-auto">
                  {imageUploading ? (
                    <span className="text-[#00C951] animate-pulse">
                      Uploading to Cloudinary...
                    </span>
                  ) : formData.image ? (
                    <span className="text-gray-300">
                      Image uploaded successfully
                    </span>
                  ) : (
                    <span>No file chosen</span>
                  )}
                </div>

                {formData.image && !imageUploading && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-12 w-12 sm:h-8 sm:w-8 object-cover rounded bg-gray-800"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-[#121212]/50 rounded-lg border border-gray-800">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  Working
                </label>
                <input
                  name="component_working"
                  type="number"
                  min="0"
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-gray-700 rounded-md p-2 text-center text-white focus:border-[#00C951] outline-none"
                  value={formData.component_working}
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  Broken
                </label>
                <input
                  name="component_not_working"
                  type="number"
                  min="0"
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-gray-700 rounded-md p-2 text-center text-white focus:border-[#00C951] outline-none"
                  value={formData.component_not_working}
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  In Use
                </label>
                <input
                  name="component_in_use"
                  type="number"
                  min="0"
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-gray-700 rounded-md p-2 text-center text-white focus:border-[#00C951] outline-none"
                  value={formData.component_in_use}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Remark / Location
              </label>
              <input
                name="remark"
                onChange={handleChange}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all placeholder-gray-600 text-sm"
                placeholder="e.g. Cabinet A"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="2"
                onChange={handleChange}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all resize-none placeholder-gray-600 text-sm"
                placeholder="Technical specifications..."
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2 pt-5 border-t border-gray-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 sm:border-transparent rounded-lg sm:rounded-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm bg-[#00C951] text-black font-semibold rounded-lg hover:bg-[#00b348] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Component"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
