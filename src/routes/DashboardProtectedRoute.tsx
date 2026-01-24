import { Navigate, Outlet } from "react-router-dom";

const DashboardProtectedRoute = () => {
  const token = localStorage.getItem("dashboard-token");

  if (!token) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return <Outlet />;
};

export default DashboardProtectedRoute;
