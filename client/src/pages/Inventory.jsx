import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Box,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CustomDropdown from "../components/CustomDropDown";
import EditModal from "../components/EditModal";
import DeleteModal from "../components/DeleteModal";
import BorrowModal from "../components/BorrowModal";
import ComponentDetailsModal from "../components/ComponentDetailsModal";
import { useAuth } from "../context/AuthContext";

export default function Inventory() {
  const { user } = useAuth();
  const userRole = user?.role;

  const [components, setComponents] = useState([]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Items");

  // --- NEW: Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const categoryMap = {
    "All Categories": "All Categories",
    "Micro Controller": "micro_controller",
    Sensor: "sensor",
    Actuator: "actuator",
    "Motor Driver": "motor_driver",
    "Power Supplies": "power_supplies",
    Communication: "communication",
    Other: "other",
  };
  const categories = Object.keys(categoryMap);
  const statuses = ["All Items", "In Stock", "Out of Stock"];

  // --- API Fetch Logic ---
  const fetchComponents = async () => {
    try {
      // Updated to use currentPage dynamically
      const endpoint = query
        ? `/api/v1/component/search?query=${query}&page=${currentPage}&limit=10`
        : `/api/v1/component/all?page=${currentPage}&limit=10`;

      const res = await fetch(endpoint);
      const json = await res.json();

      if (json.success !== false && json.data?.data) {
        setComponents(json.data.data);
        // Assuming your backend returns totalPages. If not, fallback to 1 to prevent breaking.
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching components:", err);
    }
  };

  // Fetch when query OR currentPage changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComponents();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, currentPage]);

  useEffect(() => {
    const handleNewComponent = () => fetchComponents();
    window.addEventListener("componentAdded", handleNewComponent);
    return () =>
      window.removeEventListener("componentAdded", handleNewComponent);
  }, []);

  const filteredData = useMemo(() => {
    return components.filter(
      (item) =>
        (item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())) &&
        (category === "All Categories" ||
          item.category === categoryMap[category]) &&
        (status === "All Items" ||
          (status === "In Stock"
            ? item.component_working > 0
            : item.component_working === 0)),
    );
  }, [components, query, category, status]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");

    try {
      const res = await fetch("/api/v1/component/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editData._id,
          component_working: editData.component_working,
          component_not_working: editData.component_not_working,
          component_in_use: editData.component_in_use,
          remark: editData.remark || "None",
        }),
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to update component");
      }

      fetchComponents();
      setEditData(null);
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/v1/component/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchComponents();
        setDeleteId(null);
      } else {
        console.error("Failed to delete component");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="text-gray-200 font-sans max-w-7xl mx-auto relative px-2 sm:px-0">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
          Components
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Manage and track your components
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between shadow-sm">
        <div className="relative w-full lg:w-96 shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search items, descriptions..."
            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#00C951] outline-none"
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 when searching
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 z-10 shrink-0">
          <CustomDropdown
            options={categories}
            value={category}
            onChange={(val) => {
              setCategory(val);
              setCurrentPage(1); // Reset to page 1 when filtering
            }}
          />
          <CustomDropdown
            options={statuses}
            value={status}
            onChange={(val) => {
              setStatus(val);
              setCurrentPage(1); // Reset to page 1 when filtering
            }}
          />
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-x-auto shadow-sm custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-200">
          <thead>
            <tr className="border-b border-gray-800 text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider">
              <th className="p-3 sm:p-4 pl-4 sm:pl-6 whitespace-nowrap">
                Item Details
              </th>
              <th className="p-3 sm:p-4 whitespace-nowrap">Category</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">Remark (Loc)</th>
              <th className="p-3 sm:p-4 text-center whitespace-nowrap">
                Quantity
              </th>
              <th className="p-3 sm:p-4 text-center whitespace-nowrap">
                Status
              </th>
              {userRole?.toLowerCase() === "manager" && (
                <th className="p-3 sm:p-4 pr-4 sm:pr-6 text-right whitespace-nowrap">
                  Actions
                </th>
              )}
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
                  onClick={() => setViewItem(item)}
                  className="hover:bg-[#121212]/50 transition-colors group cursor-pointer"
                >
                  <td className="p-3 sm:p-4 pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#121212] border border-gray-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Box className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-[150px] max-w-[250px]">
                      <div className="font-medium text-gray-200 text-sm truncate group-hover:text-[#00C951] transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 whitespace-nowrap">
                    <span className="text-[10px] sm:text-[11px] font-medium tracking-wide px-2.5 py-1 bg-gray-800/80 border border-gray-700 rounded-full text-gray-300">
                      {Object.keys(categoryMap).find(
                        (key) => categoryMap[key] === item.category,
                      ) || item.category}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-400 whitespace-nowrap truncate max-w-[150px]">
                    {item.remark || "Unassigned"}
                  </td>
                  <td className="p-3 sm:p-4 text-center whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-semibold text-gray-200">
                      {totalQuantity}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">
                      Work: {item.component_working}
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-center whitespace-nowrap">
                    {item.component_working > 0 ? (
                      <span className="text-[10px] sm:text-xs font-medium px-2.5 py-1 border border-[#00C951]/30 text-[#00C951] rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-xs font-medium px-2.5 py-1 border border-red-500/30 text-red-500 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  {userRole?.toLowerCase() === "manager" && (
                    <td className="p-3 sm:p-4 pr-4 sm:pr-6 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-2 sm:gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setEditData({ ...item })}
                          className="text-gray-400 hover:text-[#00C951] transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- NEW: Pagination Controls --- */}
      <div className="flex items-center justify-between mt-4 bg-[#1A1A1A] px-4 py-3 border border-gray-800 rounded-xl shadow-sm">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-300 bg-[#121212] border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-gray-400">
          Page <span className="font-semibold text-white">{currentPage}</span>{" "}
          of <span className="font-semibold text-white">{totalPages}</span>
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-300 bg-[#121212] border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <ComponentDetailsModal
        item={viewItem}
        onClose={() => setViewItem(null)}
        onRequestClick={() => setIsBorrowModalOpen(true)}
      />

      <BorrowModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        component={viewItem}
        onSuccess={() => {
          fetchComponents();
          setIsBorrowModalOpen(false);
          setViewItem(null);
        }}
      />

      <EditModal
        editData={editData}
        setEditData={setEditData}
        handleUpdate={handleUpdate}
        updateError={updateError}
      />
      <DeleteModal
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        handleDelete={handleDelete}
      />
    </div>
  );
}
