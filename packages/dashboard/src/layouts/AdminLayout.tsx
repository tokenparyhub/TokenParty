import { Routes, Route, NavLink } from "react-router-dom";
import Overview from "../pages/Overview";
import Requests from "../pages/Requests";
import Providers from "../pages/Providers";
import Users from "../pages/Users";
import Settings from "../pages/Settings";
import { clearAuth, getRole } from "../lib/api";

const navItems = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/providers", label: "Providers" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  const role = getRole();

  return (
    <div className="flex h-screen">
      <nav className="w-56 bg-gray-900 text-white p-4 flex flex-col gap-1">
        <h1 className="text-xl font-bold mb-6 px-3">TokenParty</h1>
        <div className="text-xs text-gray-500 uppercase tracking-wide px-3 mb-2">Admin</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-800"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <div className="mt-auto space-y-1">
          {role === "admin" && (
            <NavLink
              to="/"
              className="block px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              User Portal &rarr;
            </NavLink>
          )}
          <button
            onClick={() => { clearAuth(); window.location.href = "/login"; }}
            className="w-full px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white text-left"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route path="/admin" element={<Overview />} />
          <Route path="/admin/requests" element={<Requests mode="admin" />} />
          <Route path="/admin/providers" element={<Providers />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/settings" element={<Settings mode="admin" />} />
        </Routes>
      </main>
    </div>
  );
}
