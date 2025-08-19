import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout/MainLayouts";
import AuthLayout from "@/layouts/AuthLayout/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import PageNotFound from "@/pages/PageNotFound";
import UserHome from "@/pages/UserHome";
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyOtp from "@/pages/VerifyOtp";
import ResetPassword from "@/pages/ResetPassword";
import GuestHome from "@/pages/GuestHome";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default: redirect root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      {/* Available Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/guest-home" element={<GuestHome />} />
      </Route>
      {/* Protected Routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/userHome" element={<UserHome />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
