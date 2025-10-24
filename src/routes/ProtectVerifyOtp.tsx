import { Navigate } from "react-router-dom";

export default function ProtectVerifyOtp({
  children,
}: {
  children: React.ReactNode;
}) {
  const challengeId = sessionStorage.getItem("challengeId");
  if (!challengeId) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
