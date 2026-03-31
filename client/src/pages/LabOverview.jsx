import { useState, useEffect, useMemo } from "react";
import { Box, Hash, Layers, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function LabOverview() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryMap = {
    micro_controller: "Micro Controller",
    sensor: "Sensor",
    actuator: "Actuator",
    motor_driver: "Motor Driver",
    power_supplies: "Power Supplies",
    communication: "Communication",
    other: "Other",
  };

  const COLORS = ["#00C951","#3B82F6","#8B5CF6","#F59E0B","#EC4899","#14B8A6","#6366F1"];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/v1/component/stats/lab");
        const json = await res.json();

        if (!res.ok || json.success === false) {
          throw new Error(json.message || "Failed to fetch lab stats");
        }

        setStatsData(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // --- Derived Metrics ---
  const {
    totalPhysicalItems,
    totalUnique,
    totalCategories,
    totalInUse,
    chartData,
  } = useMemo(() => {
    if (!statsData)
      return {
        totalPhysicalItems: 0,
        totalUnique: 0,
        totalCategories: 0,
        totalInUse: 0,
        chartData: [],
      };

    const { overview, categories } = statsData;

    const physicalItems =
      (overview.totalWorkingStock || 0) +
      (overview.totalBrokenStock || 0) +
      (overview.totalInUseStock || 0);

    const formattedCharts = categories.map((cat) => ({
      name: categoryMap[cat._id] || cat._id,
      UniqueItems: cat.count,
      TotalStock: cat.totalWorking,
    }));

    return {
      totalPhysicalItems: physicalItems,
      totalUnique: overview.totalUniqueItems || 0,
      totalCategories: categories.length || 0,
      totalInUse: overview.totalInUseStock || 0,
      chartData: formattedCharts,
    };
  }, [statsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#00C951] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mx-4 mt-4">
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="text-gray-200 font-sans max-w-7xl mx-auto space-y-3.5 p-4 md:px-6 md:py-0"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
          Lab Overview
        </h1>
        <p className="text-xs md:text-sm text-gray-400">
          Overview of your robotics lab inventory
        </p>
      </motion.div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Physical Quantity */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm flex items-start justify-between hover:border-gray-700 transition-colors"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">
              Total Items (Quantity)
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              {totalPhysicalItems}
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
              Physical components
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#00C951]/10 rounded-lg flex items-center justify-center border border-[#00C951]/20">
            <Hash className="w-4 h-4 md:w-5 md:h-5 text-[#00C951]" />
          </div>
        </motion.div>

        {/* Total Unique Components */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm flex items-start justify-between hover:border-gray-700 transition-colors"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">
              Unique Components
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              {totalUnique}
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
              Distinct product types
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
            <Box className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          </div>
        </motion.div>

        {/* Total Categories */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm flex items-start justify-between hover:border-gray-700 transition-colors"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">
              Total Categories
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              {totalCategories}
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
              Active classifications
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
            <Layers className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
          </div>
        </motion.div>

        {/* Total In Use */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm flex items-start justify-between hover:border-gray-700 transition-colors"
        >
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">
              Components In Use
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              {totalInUse}
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
              Currently borrowed
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Items by Category */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 md:p-6 shadow-sm lg:col-span-2"
        >
          <h3 className="text-sm md:text-base font-semibold text-white mb-4 md:mb-6">
            Physical Stock by Category
          </h3>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tick={{ fontSize: 10, fill: "#888" }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#2A2A2A" }}
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    borderColor: "#333",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="TotalStock"
                  name="Total Quantity"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {/* Map over the data to assign individual colors to each bar */}
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut Chart: Category Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 md:p-6 shadow-sm flex flex-col"
        >
          <h3 className="text-sm md:text-base font-semibold text-white mb-2">
            Unique Items Distribution
          </h3>
          <div className="flex-1 w-full min-h-[200px] md:min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={5}
                  dataKey="UniqueItems"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    borderColor: "#333",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.map((entry, index) => (
              <div
                key={entry.name}
                className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400"
              >
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate" title={entry.name}>
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
