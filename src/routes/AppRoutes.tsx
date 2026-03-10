import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { jwtDecode } from "jwt-decode";

// ── Layouts ──────────────────────────────────────────────────────────────────
import MainLayout from "@/layouts/MainLayout/MainLayouts";
import AuthLayout from "@/layouts/AuthLayout/AuthLayout";
import AppLayout from "@/layouts/AppLayout/AppLayout";
import AboutLayout from "@/layouts/AboutLayout/AboutLayout";
import DashboardLayout from "@/layouts/DashboardLayout/DashboardLayout";
import AuthDashboardLoginLayout from "@/layouts/AuthDashboardLayout/AuthDashboardLayout";

// ── Route Guards ──────────────────────────────────────────────────────────────
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import ProtectVerifyOtp from "./ProtectVerifyOtp";
import ProtectResetPassword from "./ProtectResetPassword";
import DashboardPublicOnlyRoute from "./DashboardPublicOnlyRoute";
import DashboardProtectedRoute from "./DashboardProtectedRoute";

// ── Public Pages ──────────────────────────────────────────────────────────────
import GuestHome from "@/pages/GuestHome";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyOtp from "@/pages/VerifyOtp";
import VerifyOtpForForgotPassword from "@/pages/VerifyOtpForForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ChangePassword from "@/pages/ChangePassword";
import AboutUs from "@/pages/AboutUs";
import TermsOfUse from "@/pages/TermsOfUse";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import PageNotFound from "@/pages/PageNotFound";
import ContentDetailsPageForGuest from "@/pages/ContentDetailsPageForGuest";

// ── Shared / Main Pages ───────────────────────────────────────────────────────
import PopularCoursesPage from "@/pages/PopularCoursesPage";
import ProgramsList from "@/pages/ProgramsList";
import ExpertsPage from "@/pages/ExpertsPage";
import ExpertProfile from "@/pages/ExpertProfile";
import ProgramDetails from "@/pages/ProgramDetails";
import InstituteCourseDetails from "@/pages/InstituteCourseDetails";
import SearchResults from "@/pages/SearchResults";
import MyCertificates from "@/pages/MyCertificates";

// ── Protected User Pages ──────────────────────────────────────────────────────
import UserHome from "@/pages/UserHome";
import LatestCoursesPage from "@/pages/LatestCoursesPage";
import ContentDetailsPageForUser from "@/pages/ContentDetailsPageForUser";
import LessonPlayerPage from "@/pages/LessonPlayerPage";
import QuizPage from "@/pages/QuizPage";
import InstituteCourses from "@/pages/InstituteCourses";
import SavedContentsList from "@/pages/SavedContentsList";
import SavedLessons from "@/pages/SavedLessons";
import MyNotes from "@/pages/MyNotes";
import CourseMaterials from "@/pages/CourseMaterials";
import SavedItems from "@/pages/SavedItems";
import MyCourses from "@/pages/MyCourses";
import ProfileSettings from "@/pages/ProfileSettings";

// ── Dashboard Pages ───────────────────────────────────────────────────────────
import DashboardLogin from "@/pages/dashboard/DashboardLogin";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import InstitutesPage from "@/pages/dashboard/InstitutesPage";
import AddNewInstitute from "@/pages/dashboard/AddNewInstitute";
import EditInstituteDetails from "@/pages/dashboard/EditInstituteDetails";
import InstituteDetails from "@/pages/dashboard/InstituteDetails";
import BatchResults from "@/pages/dashboard/BatchResults";
import InstituteCoursesDashboard from "@/pages/dashboard/InstituteCoursesDashboard";
import StudentsPage from "@/pages/dashboard/StudentsPage";
import AddNewStudent from "@/pages/dashboard/AddNewStudent";
import EditStudentData from "@/pages/dashboard/EditStudentData";
import StudentDetails from "@/pages/dashboard/StudentDetails";
import AdminProgramsList from "@/pages/dashboard/AdminProgramsList";
import AdminProgramDetails from "@/pages/dashboard/AdminProgramDetails";
import AddNewProgram from "@/pages/dashboard/AddNewProgram";
import EditProgramDetails from "@/pages/dashboard/EditProgramDetails";
import CoursesDashboardPage from "@/pages/dashboard/CoursesDashboardPage";
import AddNewCourse from "@/pages/dashboard/AddNewCourse";
import CourseDetailsDashboard from "@/pages/dashboard/CourseDetailsDashboard";
import EditCourseDetails from "@/pages/dashboard/EditCourseDetails";
import LearningPathsDashboard from "@/pages/dashboard/LearningPathsDashboard";
import AddNewLearningPath from "@/pages/dashboard/AddNewLearningPath";
import EditLearningPath from "@/pages/dashboard/EditLearningPath";
import LearningPathDashboard from "@/pages/dashboard/LearningPathDashboard";
import ExpertsListDashboard from "@/pages/dashboard/ExpertsListDashboard";
import AddNewExpert from "@/pages/dashboard/AddNewExpert";
import EditExpertDetails from "@/pages/dashboard/EditExpertDetails";
import ExpertDetailsDashboard from "@/pages/dashboard/ExpertDetailsDashboard";
import ContentsList from "@/pages/dashboard/ContentsList";
import AddNewContent from "@/pages/dashboard/AddNewContent";
import ContentDetails from "@/pages/dashboard/ContentDetails";
import EditContent from "@/pages/dashboard/EditContent";
import AddNewTopic from "@/pages/dashboard/AddNewTopic";
import EditTopic from "@/pages/dashboard/EditTopic";
import AddNewLesson from "@/pages/dashboard/AddNewLesson";
import LessonDetailsDashboard from "@/pages/dashboard/LessonDetailsDashboard";
import EditLessonData from "@/pages/dashboard/EditLessonData";
import Locations from "@/pages/dashboard/Locations";
import AddNewCountry from "@/pages/dashboard/AddNewCountry";
import EditCountry from "@/pages/dashboard/EditCountry";
import AddNewCity from "@/pages/dashboard/AddNewCity";
import EditCity from "@/pages/dashboard/EditCity";
import AddNewRegion from "@/pages/dashboard/AddNewRegion";
import EditRegion from "@/pages/dashboard/EditRegion";
import RolesList from "@/pages/dashboard/RolesList";
import AddNewRole from "@/pages/dashboard/AddNewRole";
import EditRole from "@/pages/dashboard/EditRole";
import SystemUsersList from "@/pages/dashboard/SystemUsersList";
import AddNewSystemUser from "@/pages/dashboard/AddNewSystemUser";
import SystemUserDetails from "@/pages/dashboard/SystemUserDetails";
import EditSystemUser from "@/features/Dashboard/components/EditSystemUser";
import DashboardRoute from "./DashboardRoute";
import StudentInInstitute from "@/pages/dashboard/StudentInInstitute";
import StudentsInInstitute from "@/features/Dashboard/components/StudentsInInstitute";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  INST_ADMIN: "INST_ADMIN",
};

// Shorthand permission sets reused across many routes
const ALL_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INST_ADMIN];
const SUPER_AND_ADMIN = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const SUPER_ONLY = [ROLES.SUPER_ADMIN];

// ─────────────────────────────────────────────────────────────────────────────
// INST_ADMIN INSTITUTES REDIRECT
// Reads instituteId from the token and redirects to their own institute page.
// ─────────────────────────────────────────────────────────────────────────────
function InstAdminInstitutesRedirect() {
  const { dashboardToken } = useAuth();
  try {
    const { instituteId } = jwtDecode(dashboardToken);
    if (instituteId)
      return <Navigate to={`/dashboard/institutes/${instituteId}`} replace />;
  } catch {
    return <Navigate to="/dashboard/login" replace />;
  }
  return <Navigate to="/dashboard/home" replace />;
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTES
// ─────────────────────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Routes>
      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT — shared public browsing pages (header + footer)
      ══════════════════════════════════════════════════════════════════════ */}
      <Route path="/" element={<MainLayout />}>
        <Route path="/popular-courses-list" element={<PopularCoursesPage />} />
        <Route path="/programs-list" element={<ProgramsList />} />
        <Route path="/experts-list" element={<ExpertsPage />} />
        <Route path="/expert/:expertId" element={<ExpertProfile />} />
        <Route
          path="/program-details/:programId"
          element={<ProgramDetails />}
        />
        <Route
          path="/institute-course-details/:instituteCourseId"
          element={<InstituteCourseDetails />}
        />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/my-certificates" element={<MyCertificates />} />
      </Route>

      {/* ══════════════════════════════════════════════════════════════════════
          ABOUT LAYOUT — static informational pages
      ══════════════════════════════════════════════════════════════════════ */}
      <Route path="/" element={<AboutLayout />}>
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>

      {/* ══════════════════════════════════════════════════════════════════════
          AUTH LAYOUT — guest-only authentication flow
      ══════════════════════════════════════════════════════════════════════ */}
      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/verify-otp"
          element={
            <ProtectVerifyOtp>
              <VerifyOtp />
            </ProtectVerifyOtp>
          }
        />
        <Route
          path="/forgot-password-verify-otp"
          element={
            <ProtectVerifyOtp>
              <VerifyOtpForForgotPassword />
            </ProtectVerifyOtp>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectResetPassword>
              <ResetPassword />
            </ProtectResetPassword>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectResetPassword>
              <ChangePassword />
            </ProtectResetPassword>
          }
        />
      </Route>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT (PUBLIC ONLY) — guest home & course preview
      ══════════════════════════════════════════════════════════════════════ */}
      <Route
        element={
          <PublicOnlyRoute>
            <MainLayout />
          </PublicOnlyRoute>
        }
      >
        <Route index element={<GuestHome />} />
        <Route
          path="/guest-course-details/:courseId"
          element={<ContentDetailsPageForGuest />}
        />
      </Route>

      {/* ══════════════════════════════════════════════════════════════════════
          APP LAYOUT — protected logged-in user pages
      ══════════════════════════════════════════════════════════════════════ */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/userHome" element={<UserHome />} />
        <Route path="/latest-courses" element={<LatestCoursesPage />} />
        <Route
          path="/user-course-details/:courseId"
          element={<ContentDetailsPageForUser />}
        />
        <Route
          path="/course-lesson/:courseId/:lessonId"
          element={<LessonPlayerPage />}
        />
        <Route path="/quiz-page/:courseId/:lessonId" element={<QuizPage />} />
        <Route path="/institute-courses" element={<InstituteCourses />} />
        <Route path="/saved-contents" element={<SavedContentsList />} />
        <Route path="/saved-lessons/:courseId" element={<SavedLessons />} />
        <Route path="/content-notes/:courseId" element={<MyNotes />} />
        <Route
          path="/content-materials/:courseId"
          element={<CourseMaterials />}
        />
        <Route path="/saved-items" element={<SavedItems />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/my-settings" element={<ProfileSettings />} />
      </Route>

      {/* ══════════════════════════════════════════════════════════════════════
          DASHBOARD LOGIN — guest-only dashboard entry point
      ══════════════════════════════════════════════════════════════════════ */}
      <Route
        element={
          <DashboardPublicOnlyRoute>
            <AuthDashboardLoginLayout />
          </DashboardPublicOnlyRoute>
        }
      >
        <Route path="/dashboard/login" element={<DashboardLogin />} />
      </Route>

      {/* ══════════════════════════════════════════════════════════════════════
          DASHBOARD — role-protected admin panel
      ══════════════════════════════════════════════════════════════════════ */}
      <Route element={<DashboardProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          {/* ── ALL roles ─────────────────────────────────────────────────── */}
          <Route
            path="/dashboard/home"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <DashboardHome />
              </DashboardRoute>
            }
          />

          {/* ── Institutes ────────────────────────────────────────────────── */}

          {/*  SUPER_ADMIN & ADMIN → institute list/add/edit  */}
          <Route
            path="/dashboard/institutes"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <InstitutesPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutes/student/:studentId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <StudentInInstitute />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutes/add"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewInstitute />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutes/edit/:instituteId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditInstituteDetails />
              </DashboardRoute>
            }
          />

          {/*  INST_ADMIN → /dashboard/institutes redirects to their own page  */}
          <Route
            path="/dashboard/institutes/me"
            element={
              <DashboardRoute allowed={[ROLES.INST_ADMIN]}>
                <InstAdminInstitutesRedirect />
              </DashboardRoute>
            }
          />

          {/*  ALL roles → view any institute detail & batch results  */}
          <Route
            path="/dashboard/institutes/:instituteId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <InstituteDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutes/:instituteId/batch-results/:batchId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <BatchResults />
              </DashboardRoute>
            }
          />

          {/* ── Institute (Training) Courses — ALL roles ──────────────────── */}
          <Route
            path="/institute-courses"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <InstituteCoursesDashboard />
              </DashboardRoute>
            }
          />

          {/* ── Users — SUPER_ADMIN & ADMIN ───────────────────────────────── */}
          <Route
            path="/dashboard/users"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <StudentsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/users/add"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewStudent />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/users/edit/:studentId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditStudentData />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/users/:studentId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <StudentInInstitute />
              </DashboardRoute>
            }
          />

          {/* ── Programs — SUPER_ADMIN & ADMIN ────────────────────────────── */}
          <Route
            path="/dashboard/programs"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AdminProgramsList />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/programs/add"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewProgram />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/programs/:programId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AdminProgramDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/programs/edit/:programId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditProgramDetails />
              </DashboardRoute>
            }
          />

          {/* ── Courses — SUPER_ADMIN & ADMIN ─────────────────────────────── */}
          <Route
            path="/dashboard/courses"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <CoursesDashboardPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/courses/add"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewCourse />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/courses/edit/:courseId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditCourseDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/courses/:courseId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <CourseDetailsDashboard />
              </DashboardRoute>
            }
          />

          {/* ── Learning Paths — SUPER_ADMIN & ADMIN ──────────────────────── */}
          <Route
            path="/dashboard/learning-paths"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <LearningPathsDashboard />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/learning-paths/add"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewLearningPath />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/learning-paths/edit/:learningPathId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditLearningPath />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/learning-paths/:learningPathId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <LearningPathDashboard />
              </DashboardRoute>
            }
          />

          {/* ── Experts — SUPER_ADMIN & ADMIN ─────────────────────────────── */}
          <Route
            path="/dashboard/experts"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <ExpertsListDashboard />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/experts/add"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewExpert />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/experts/edit/:expertId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditExpertDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/experts/:expertId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <ExpertDetailsDashboard />
              </DashboardRoute>
            }
          />

          {/* ── Contents — SUPER_ADMIN & ADMIN ────────────────────────────── */}
          <Route
            path="/dashboard/contents"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <ContentsList />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/add"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewContent />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <ContentDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/edit/:contentId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditContent />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/add-new-topic"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewTopic />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/edit-topic/:topicId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditTopic />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/topic/:topicId/add-new-lesson"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewLesson />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/topic/:topicId/edit-lesson/:lessonId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditLessonData />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/topics/:topicId/lessons/:lessonId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <LessonDetailsDashboard />
              </DashboardRoute>
            }
          />

          {/* ── Locations — SUPER_ADMIN & ADMIN ───────────────────────────── */}
          <Route
            path="/dashboard/location"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <Locations />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/location/add-new-country"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewCountry />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/location/countries/:countryId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditCountry />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/location/add-new-city"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewCity />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/location/cities/:cityId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditCity />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/location/add-new-region"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <AddNewRegion />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/location/regions/:regionId"
            element={
              <DashboardRoute allowed={SUPER_AND_ADMIN}>
                <EditRegion />
              </DashboardRoute>
            }
          />

          {/* ── Roles — SUPER_ADMIN only ───────────────────────────────────── */}
          <Route
            path="/dashboard/roles"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <RolesList />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/roles/add-new-role"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <AddNewRole />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/roles/edit-role/:roleId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <EditRole />
              </DashboardRoute>
            }
          />

          {/* ── System Users — SUPER_ADMIN only ───────────────────────────── */}
          <Route
            path="/dashboard/system-users"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <SystemUsersList />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/system-users/add-new-user"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <AddNewSystemUser />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/system-users/:systemUserId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <SystemUserDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/system-users/edit-user/:systemUserId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <EditSystemUser />
              </DashboardRoute>
            }
          />
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════════════════════════
          CATCH-ALL
      ══════════════════════════════════════════════════════════════════════ */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
