import { Routes, Route } from "react-router-dom";
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
import AppLayout from "@/layouts/AppLayout/AppLayout";
import PublicOnlyRoute from "./PublicOnlyRoute";
import PopularCoursesPage from "@/pages/PopularCoursesPage";
import ExpertsPage from "@/pages/ExpertsPage";
import ProgramsList from "@/pages/ProgramsList";
import CourseDetails from "@/pages/CourseDetailsPageForGuest";
export default function AppRoutes() {
  return (
    <Routes>
      {/* Default: redirect root */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<GuestHome />} />
        <Route path="/popular-courses-list" element={<PopularCoursesPage />} />
        <Route path="/guest-course-details/:id" element={<CourseDetails />} />

        <Route path="/programs-list" element={<ProgramsList />} />
        <Route path="/experts-list" element={<ExpertsPage />} />
      </Route>

      {/* Public Routes with AuthLayout */}
      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
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
