import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Box, PackagePlus, ShoppingCart } from "lucide-react";

export default function Layout({ userRole = "admin" }) {
  // Toggle to 'user' to test
  const navLinks = [
    {
      name: "Lab Overview",
      path: "/",
      icon: LayoutDashboard,
      roles: ["admin", "user"],
    },
    {
      name: "Components",
      path: "/inventory",
      icon: Box,
      roles: ["admin", "user"],
    },
    {
      name: "Add Component",
      path: "/add-component",
      icon: PackagePlus,
      roles: ["admin", "user"],
    },
    {
      name: "Borrow Component",
      path: "/borrow",
      icon: ShoppingCart,
      roles: ["user"],
    },
  ];

  return (
    <div className="flex h-screen bg-evolve-bg text-gray-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-evolve-surface border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 font-bold text-xl text-white">
          <div className="w-6 h-6 bg-evolve-green rounded mr-3 shrink-0"></div>
          Evolve Lab
        </div>

        <div className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider">
          NAVIGATION
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navLinks
            .filter((link) => link.roles.includes(userRole))
            .map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
                    isActive
                      ? "bg-blue-600/20 text-blue-500" // Reference image uses blue for active states
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </NavLink>
            ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-8 justify-end">
          <div className="text-xs font-medium text-evolve-green bg-evolve-green/10 px-3 py-1.5 rounded-full border border-evolve-green/20">
            Current Role: {userRole.toUpperCase()}
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
