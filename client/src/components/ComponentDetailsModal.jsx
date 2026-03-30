import { X, Box, Activity, Hash, Layers, MapPin } from "lucide-react";

export default function ComponentDetailsModal({ item, onClose }) {
  if (!item) return null;

  const totalQuantity =
    item.component_working + item.component_in_use + item.component_not_working;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Component Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6 sm:gap-8">
          <div className="w-full md:w-2/5 shrink-0 flex flex-col gap-3">
            <div className="w-full aspect-square bg-[#121212] border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden relative group">
              <Box className="w-16 h-16 text-gray-700 absolute" />
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="flex justify-center mt-2">
              {item.component_working > 0 ? (
                <span className="text-xs font-medium px-3 py-1 bg-[#00C951]/10 border border-[#00C951]/30 text-[#00C951] rounded-full">
                  In Stock
                </span>
              ) : (
                <span className="text-xs font-medium px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5 sm:gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Layers className="w-4 h-4" />
                <span className="capitalize">
                  {item.category.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed bg-[#121212] p-4 rounded-xl border border-gray-800">
                {item.description ||
                  "No description provided for this component."}
              </p>
            </div>

            <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Total
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {totalQuantity}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Box className="w-4 h-4 text-[#00C951]" />
                    <span className="text-[10px] sm:text-xs text-[#00C951]/80 uppercase tracking-wider font-semibold">
                      Working
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-[#00C951] mt-1">
                    {item.component_working}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] sm:text-xs text-orange-500/80 uppercase tracking-wider font-semibold">
                      In Use
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-orange-500 mt-1">
                    {item.component_in_use}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] sm:text-xs text-red-500/80 uppercase tracking-wider font-semibold">
                      Broken
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-red-500 mt-1">
                    {item.component_not_working}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#121212] p-4 rounded-xl border border-gray-800 mt-auto">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                  Location / Remark
                </span>
                <span className="text-sm text-gray-300">
                  {item.remark || "Unassigned location"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
