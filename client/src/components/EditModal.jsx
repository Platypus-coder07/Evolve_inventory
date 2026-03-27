import { X } from "lucide-react";

export default function EditModal({
  editData,
  setEditData,
  handleUpdate,
  updateError,
}) {
  if (!editData) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <form
        onSubmit={handleUpdate}
        className="bg-[#1A1A1A] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Edit Component</h2>
          <button
            type="button"
            onClick={() => setEditData(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* ADDED: Error Banner Display */}
          {updateError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {updateError}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
              Component Name (Read-Only)
            </label>
            <input
              disabled
              value={editData.name}
              className="w-full bg-[#121212] border border-gray-800 rounded-lg p-2.5 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Working
              </label>
              <input
                type="number"
                min="0"
                value={editData.component_working}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    component_working: Number(e.target.value),
                  })
                }
                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">In Use</label>
              <input
                type="number"
                min="0"
                value={editData.component_in_use}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    component_in_use: Number(e.target.value),
                  })
                }
                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Broken</label>
              <input
                type="number"
                min="0"
                value={editData.component_not_working}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    component_not_working: Number(e.target.value),
                  })
                }
                className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none text-center"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Remark / Location
            </label>
            <input
              type="text"
              value={editData.remark}
              onChange={(e) =>
                setEditData({ ...editData, remark: e.target.value })
              }
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#00C951] outline-none text-sm"
            />
          </div>
        </div>
        <div className="p-5 border-t border-gray-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditData(null)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-[#00C951] text-black font-semibold rounded-lg hover:bg-[#00b348] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
