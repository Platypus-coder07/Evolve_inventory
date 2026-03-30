import { AlertTriangle } from "lucide-react";

export default function DeleteModal({ deleteId, setDeleteId, handleDelete }) {
  if (!deleteId) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-5 sm:p-6 text-center">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Delete Component?
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 mb-6 px-2">
          This action cannot be undone. This will permanently remove the item
          from the lab inventory.
        </p>
        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
          <button
            onClick={() => setDeleteId(null)}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete Item
          </button>
        </div>
      </div>
    </div>
  );
}
