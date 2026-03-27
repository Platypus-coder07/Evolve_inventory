import { useState, useMemo, useEffect } from "react";
import { Search, Edit2, Trash2, Plus, Box } from "lucide-react";
import CustomDropdown from "../components/CustomDropDown";
import EditModal from "../components/EditModal";
import DeleteModal from "../components/DeleteModal";
import { useAuth } from "../context/AuthContext";

export default function Inventory() {

  const { user } = useAuth();
  const userRole = user?.role;


  const [components, setComponents] = useState([]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Items");

  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const categoryMap = {
    "All Categories": "All Categories",
    "Micro Controller": "micro_controller",
    "Sensor": "sensor",
    "Actuator": "actuator",
    "Motor Driver": "motor_driver",
    "Power Supplies": "power_supplies",
    "Communication": "communication",
    "Other": "other",
  };
  const categories = Object.keys(categoryMap);
  const statuses = ["All Items", "In Stock", "Out of Stock"];

  // --- API Fetch Logic ---
  const fetchComponents = async () => {
    try {
      const endpoint = query
        ? `/api/v1/component/search?query=${query}&page=1&limit=20`
        : `/api/v1/component/all?page=1&limit=20`;

      const res = await fetch(endpoint);
      const json = await res.json();

      if (json.success !== false && json.data?.data) {
        setComponents(json.data.data);
      }
    } catch (err) {
      console.error("Error fetching components:", err);
    }
  };

  // Fetch on mount and when query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComponents();
    }, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleNewComponent = () => fetchComponents();
    window.addEventListener("componentAdded", handleNewComponent);
    return () =>
      window.removeEventListener("componentAdded", handleNewComponent);
  }, [query]);

  // Client-side filtering applies to the fetched components
  const filteredData = useMemo(() => {
    return components.filter(
      (item) =>
        (item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())) &&
        // Update the category check here to use categoryMap[category]
        (category === "All Categories" ||
          item.category === categoryMap[category]) &&
        (status === "All Items" ||
          (status === "In Stock"
            ? item.component_working > 0
            : item.component_working === 0)),
    );
  }, [components, query, category, status]);

  const [updateError, setUpdateError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError(""); // Clear previous errors

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

      // Check for success flag 
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


  // --- API Delete Logic ---
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
            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[#00C951] outline-none"
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
        <table className="w-full text-left border-collapse min-w-200">
          <thead>
            <tr className="border-b border-gray-800 text-xs font-semibold text-white uppercase tracking-wider">
              <th className="p-4 pl-6">Item Details</th>
              <th className="p-4">Category</th>
              <th className="p-4">Remark (Loc)</th>
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4 text-center">Status</th>
              {userRole?.toLowerCase() === "manager" && (
                <th className="p-4 pr-6 text-right">Actions</th>
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
                  className="hover:bg-[#121212]/50 transition-colors group"
                >
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
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
                      {Object.keys(categoryMap).find(
                        (key) => categoryMap[key] === item.category,
                      ) || item.category}
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
                  {userRole?.toLowerCase() === "manager" && (
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditData({ ...item })}
                          className="text-gray-400 hover:text-[#00C951] transition-colors"
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
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditModal
        editData={editData}
        setEditData={setEditData}
        handleUpdate={handleUpdate}
      />
      <DeleteModal
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        handleDelete={handleDelete}
      />
    </div>
  );
}
