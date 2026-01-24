import { Navigate } from "react-router-dom";

const DashboardPublicOnlyRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const token = localStorage.getItem("dashboard-token");

  if (token) {
    return <Navigate to="/dashboard/home" replace />;
  }

  return children;
};

export default DashboardPublicOnlyRoute;
