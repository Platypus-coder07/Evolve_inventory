import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  PackagePlus,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Lock,
  Key,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import AddComponentModal from "./AddComponent";
import ChangePasswordModal from "./ChangePassworModal";
import ResetPasswordModal from "./ResetPasswordModal";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.role || "user";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // --- CHANGED: Password actions removed from this array ---
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
      actionType: "addComponent",
      icon: PackagePlus,
      roles: ["manager"],
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

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleActionClick = (actionType) => {
    if (actionType === "addComponent") setIsAddModalOpen(true);
    if (actionType === "changePassword") setIsChangePasswordOpen(true);
    if (actionType === "resetPassword") setIsResetPasswordOpen(true);
    closeSidebar();
  };

  return (
    <div className="flex h-screen bg-[#121212] text-gray-300 font-sans w-full overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 font-bold text-xl text-white">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[#00C951] rounded mr-3 shrink-0"></div>
            Evolve Lab
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={closeSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider">
          NAVIGATION
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks
            .filter((link) => link.roles.includes(userRole.toLowerCase()))
            .map((link) => {
              if (link.actionType) {
                return (
                  <button
                    key={link.name}
                    onClick={() => handleActionClick(link.actionType)}
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
                  onClick={closeSidebar}
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

        {/* --- CHANGED: Added flex-col and gap to stack buttons, moved password actions here --- */}
        <div className="p-4 border-t border-gray-800 flex flex-col gap-1">
          <button
            onClick={() => handleActionClick("changePassword")}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all font-medium text-sm"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>

          {/* Only render this if the user is a manager */}
          {userRole.toLowerCase() === "manager" && (
            <button
              onClick={() => handleActionClick("resetPassword")}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all font-medium text-sm"
            >
              <Key className="w-4 h-4" />
              Reset User Password
            </button>
          )}

          {/* Tiny subtle divider between settings and logout */}
          <div className="h-px bg-gray-800/50 my-1 mx-2"></div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between md:justify-end px-4 md:px-8 border-b border-gray-800/50 shrink-0">
          <button
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-sm text-gray-400 truncate max-w-[120px] md:max-w-none">
              {user?.name}
            </span>
            <div className="text-[10px] md:text-xs font-medium text-[#00C951] bg-[#00C951]/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-[#00C951]/20 shrink-0">
              {userRole.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
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

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />
    </div>
  );
}
