import { useAuth } from "@/features/auth/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/userHome" replace />;
  }
  return children;
}
