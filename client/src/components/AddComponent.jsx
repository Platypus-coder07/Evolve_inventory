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

  // Cloudinary Upload Handler
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
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            Add New Component
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                name="name"
                required
                onChange={handleChange}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none transition-all placeholder-gray-600 text-sm"
                placeholder="e.g. ESP32 Microcontroller"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
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

          {/* CLOUDINARY FILE UPLOAD SECTION */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Component Image *
            </label>
            <div className="flex items-center gap-4 bg-[#121212] border border-gray-700 rounded-lg p-2.5">
              <label className="flex items-center justify-center bg-[#1A1A1A] border border-gray-600 hover:border-[#00C951] text-gray-300 hover:text-[#00C951] transition-colors rounded-md px-3 py-1.5 cursor-pointer text-sm">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 text-sm text-gray-500 truncate">
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
                  className="h-8 w-8 object-cover rounded bg-gray-800"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-[#121212]/50 rounded-lg border border-gray-800">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
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
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-5 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="px-4 py-2 text-sm bg-[#00C951] text-black font-semibold rounded-lg hover:bg-[#00b348] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Component"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
