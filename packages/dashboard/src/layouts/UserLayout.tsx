import { Routes, Route, NavLink } from "react-router-dom";
import UserDashboard from "../pages/UserDashboard";
import Requests from "../pages/Requests";
import Settings from "../pages/Settings";
import { clearAuth, getRole, getUserName } from "../lib/api";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/requests", label: "Requests" },
  { to: "/settings", label: "Settings" },
];

export default function UserLayout() {
  const role = getRole();
  const name = getUserName();

  return (
    <div className="flex h-screen">
      <nav className="w-56 bg-gray-900 text-white p-4 flex flex-col gap-1">
        <h1 className="text-xl font-bold mb-6 px-3">TokenParty</h1>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-800"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <div className="mt-auto space-y-1">
          {name && (
            <div className="px-3 py-2 text-xs text-gray-500 truncate">{name}</div>
          )}
          {role === "admin" && (
            <NavLink
              to="/admin"
              className="block px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              Admin Panel &rarr;
            </NavLink>
          )}
          <button
            onClick={() => { clearAuth(); window.location.href = "/login?switch"; }}
            className="w-full px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white text-left"
          >
            Switch Account
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/requests" element={<Requests mode="user" />} />
          <Route path="/settings" element={<Settings mode="user" />} />
        </Routes>
      </main>
    </div>
  );
}
