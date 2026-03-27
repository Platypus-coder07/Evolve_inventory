import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  PackagePlus,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import AddComponentModal from "./AddComponent";

export default function Layout() {
  // Pull the actual user and logout function from context
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Default to "user" if role is somehow undefined to prevent crashes
  const userRole = user?.role || "user";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navLinks = [
    {
      name: "Lab Overview",
      path: "/",
      icon: LayoutDashboard,
      roles: ["manager", "user"],
    },
    {
      name: "Components",
      path: "/inventory",
      icon: Box,
      roles: ["manager", "user"],
    },
    {
      name: "Add Component",
      isAction: true,
      icon: PackagePlus,
      roles: ["manager"], // only managers add items
    },
    {
      name: "Borrow Component",
      path: "/borrow",
      icon: ShoppingCart,
      roles: ["user", "manager"],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#121212] text-gray-300 font-sans w-full">
      <aside className="w-64 bg-[#1A1A1A] border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 font-bold text-xl text-white">
          <div className="w-6 h-6 bg-[#00C951] rounded mr-3 shrink-0"></div>
          Evolve Lab
        </div>

        <div className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider">
          NAVIGATION
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navLinks
            .filter((link) => link.roles.includes(userRole.toLowerCase()))
            .map((link) => {
              if (link.isAction) {
                return (
                  <button
                    key={link.name}
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all font-medium text-sm"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </button>
                );
              }

              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
                      isActive
                        ? "bg-[#00C951]/10 text-[#00C951]"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    }`
                  }
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              );
            })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-8 justify-end border-b border-gray-800/50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.name}</span>
            <div className="text-xs font-medium text-[#00C951] bg-[#00C951]/10 px-3 py-1.5 rounded-full border border-[#00C951]/20">
              {userRole.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      <AddComponentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event("componentAdded"));
        }}
      />
    </div>
  );
}
