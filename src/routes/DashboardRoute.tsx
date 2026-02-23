import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/features/auth/context/AuthContext";

function DashboardRoute({ allowed, children }) {
  const { dashboardToken } = useAuth();
  if (!dashboardToken) return <Navigate to="/dashboard/login" replace />;

  try {
    const { role } = jwtDecode(dashboardToken);
    if (!allowed.includes(role))
      return <Navigate to="/dashboard/home" replace />;
  } catch {
    return <Navigate to="/dashboard/login" replace />;
  }

  return children;
}
export default DashboardRoute;
