import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Box,
  ChevronDown,
  X,
  AlertTriangle,
} from "lucide-react";

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-40 bg-[#121212] border ${isOpen ? "border-[#00C951]" : "border-gray-700"} text-gray-300 text-sm rounded-lg px-4 py-2 outline-none transition-colors hover:border-[#00C951]`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const dummyData = [
  {
    _id: "1",
    name: "ESP32 DevKit V1",
    description: "Dual-core Wi-Fi & Bluetooth MCU",
    category: "Microcontrollers",
    remark: "Cabinet A - Shelf 2",
    component_working: 15,
    component_not_working: 2,
    component_in_use: 8,
  },
  {
    _id: "2",
    name: "L298N Motor Driver",
    description: "Dual H-Bridge motor controller",
    category: "Actuators",
    remark: "Cabinet B - Shelf 1",
    component_working: 8,
    component_not_working: 1,
    component_in_use: 4,
  },
  {
    _id: "3",
    name: "18650 Li-ion Cell",
    description: "3.7V 2600mAh rechargeable battery",
    category: "Power",
    remark: "Battery Drawer",
    component_working: 40,
    component_not_working: 5,
    component_in_use: 12,
  },
];

export default function Inventory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Items");

  // Modal States
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const categories = [
    "All Categories",
    "Microcontrollers",
    "Sensors",
    "Power",
    "Actuators",
  ];
  const statuses = ["All Items", "In Stock", "Out of Stock"];

  const filteredData = useMemo(() => {
    return dummyData.filter(
      (item) =>
        (item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())) &&
        (category === "All Categories" || item.category === category) &&
        (status === "All Items" ||
          (status === "In Stock"
            ? item.component_working > 0
            : item.component_working === 0)),
    );
  }, [query, category, status]);

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Submitting to /api/v1/component/update:", editData);
    // TODO: Add fetch call here
    setEditData(null);
  };

  const handleDelete = () => {
    console.log(`Submitting to /api/v1/component/${deleteId} via DELETE`);
    // TODO: Add fetch call here
    setDeleteId(null);
  };

  return (
    <div className="text-gray-200 font-sans max-w-7xl mx-auto relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
          Components
        </h1>
        <p className="text-sm text-gray-400">
          Manage and track your components
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search items, descriptions..."
            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#00C951] outline-none transition-all"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex w-full md:w-auto gap-3 z-10">
          <CustomDropdown
            options={categories}
            value={category}
            onChange={setCategory}
          />
          <CustomDropdown
            options={statuses}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-800 text-xs font-semibold text-white uppercase tracking-wider">
              <th className="p-4 pl-6">Item Details</th>
              <th className="p-4">Category</th>
              <th className="p-4">Remark (Loc)</th>
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredData.map((item) => {
              const totalQuantity =
                item.component_working +
                item.component_in_use +
                item.component_not_working;
              return (
                <tr
                  key={item._id}
                  className="hover:bg-[#121212]/50 transition-colors group"
                >
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Box className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-200">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] font-medium tracking-wide px-2.5 py-1 bg-gray-800/80 border border-gray-700 rounded-full text-gray-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {item.remark || "Unassigned"}
                  </td>
                  <td className="p-4 text-center">
                    <div className="text-sm font-semibold text-gray-200">
                      {totalQuantity}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      Work: {item.component_working}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {item.component_working > 0 ? (
                      <span className="text-xs font-medium px-2.5 py-1 border border-[#00C951]/30 text-[#00C951] rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 border border-red-500/30 text-red-500 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditData({ ...item })}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUpdate}
            className="bg-[#1A1A1A] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                Edit Component
              </h2>
              <button
                type="button"
                onClick={() => setEditData(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
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
                  <label className="block text-xs text-gray-400 mb-1">
                    In Use
                  </label>
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
                  <label className="block text-xs text-gray-400 mb-1">
                    Broken
                  </label>
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
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Component?
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              This action cannot be undone. This will permanently remove the
              item from the lab inventory.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
