import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import { getToken, getRole } from "./lib/api";

function UserGuard({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  if (location.pathname.startsWith("/admin")) {
    return (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    );
  }

  return (
    <UserGuard>
      <UserLayout />
    </UserGuard>
  );
}
