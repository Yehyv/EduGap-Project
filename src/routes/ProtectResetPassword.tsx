import { Navigate } from "react-router-dom";

export default function ProtectResetPassword({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
