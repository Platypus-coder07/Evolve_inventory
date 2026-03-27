import { motion } from "framer-motion";
import { Package, Hash, AlertTriangle, Grid } from "lucide-react";

const stats = [
  {
    id: 1,
    title: "Total Items",
    value: "15",
    subtitle: "Unique products",
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: 2,
    title: "Total Quantity",
    value: "818",
    subtitle: "Items in stock",
    icon: Hash,
    color: "text-[#00C951]",
    bg: "bg-[#00C951]/10",
  },
  {
    id: 3,
    title: "Low Stock Alerts",
    value: "0",
    subtitle: "Needs attention",
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    id: 4,
    title: "Categories",
    value: "6",
    subtitle: "Product types",
    icon: Grid,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function LabOverview() {
  return (
    <div className="text-gray-200">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">Lab Overview</h1>
        <p className="text-sm text-gray-400">
          Overview of your robotics lab inventory
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            variants={itemVariants}
            className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-5 shadow-sm hover:border-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-gray-400">
                {stat.title}
              </h3>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 h-80 flex flex-col"
        >
          <h3 className="text-[#00C951] font-semibold mb-4">
            Items by Category
          </h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-500 text-sm">
              Bar Chart Component (e.g., Recharts) goes here
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 h-80 flex flex-col"
        >
          <h3 className="text-purple-400 font-semibold mb-4">
            Category Distribution
          </h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-500 text-sm">
              Donut Chart Component goes here
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
