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
import EditUserData from "@/pages/dashboard/EditUserData";
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
import LatestCoursesPageForGuest from "@/pages/LatestCoursesPageForGuest";
import ContactUsPage from "@/pages/ContactUsPage";
import JoinUsPage from "@/pages/JoinUsPage";
import EditStudentInInstitute from "@/pages/dashboard/EditStudentInInstitute";
import SubscriptionPlans from "@/pages/dashboard/SubscriptionPlans";
import AddNewPlan from "@/pages/dashboard/AddNewPlan";
import EditPlan from "@/pages/dashboard/EditPlan";
import PlanDetails from "@/pages/dashboard/PlanDetails";
import InstitutionsContractsList from "@/pages/dashboard/InstitutionsContractsList";
import CreateAnnualContract from "@/pages/dashboard/CreateAnnualContract";
import EditAnnualContract from "@/pages/dashboard/EditAnnualContract";
import AnnualContractDetails from "@/pages/dashboard/AnnualContractDetails";
import InstallmentsList from "@/pages/dashboard/InstallmentsList";
import InstallmentDetails from "@/pages/dashboard/InstallmentDetails";
import GenerateInstallment from "@/pages/dashboard/GenerateInstallment";
import EditInstallment from "@/pages/dashboard/EditInstallment";
import ContractPaymentsList from "@/pages/dashboard/ContractPaymentsList";
import RecordPaymentPage from "@/pages/dashboard/RecordPaymentPage";
import PaymentDetailsPage from "@/pages/dashboard/PaymentDetailsPage";
import CancelPayment from "@/pages/dashboard/CancelPayment";
import PaymentSuccessPage from "@/pages/dashboard/PaymentSuccessPage";
import AnnualSettlementDashboard from "@/pages/dashboard/Reports/SuperAdmin/AnnualSettlementDashboard";
import AnnualSettlementDetails from "@/pages/dashboard/Reports/SuperAdmin/AnnualSettlementDetails";
import CollectionSummaryPage from "@/pages/dashboard/Reports/SuperAdmin/CollectionSummaryPage";
import OverdueInstallmentsPage from "@/pages/dashboard/Reports/SuperAdmin/OverdueInstallmentsPage";
import UpcomingPaymentsPage from "@/pages/dashboard/Reports/SuperAdmin/UpcomingPaymentsPage";
import PaymentPercentagePage from "@/pages/dashboard/Reports/SuperAdmin/PaymentPercentagePage";
import DiscountTaxPage from "@/pages/dashboard/Reports/SuperAdmin/DiscountTaxPage";
import AdministrativeFeesPage from "@/pages/dashboard/Reports/SuperAdmin/AdministrativeFeesPage";
import YearlyRevenuePage from "@/pages/dashboard/Reports/SuperAdmin/YearlyRevenuePage";
import FinancialReportsExportPage from "@/pages/dashboard/Reports/SuperAdmin/FinancialReportsExportPage";
import InstitutionBillingDashboard from "@/pages/dashboard/Reports/InstAdmin/InstitutionBillingDashboard";
import MyContractPage from "@/pages/dashboard/Reports/InstAdmin/MyContractPage";
import PlanDetailsPage from "@/pages/dashboard/Reports/InstAdmin/PlanDetailsPage";
import InstituteInstallmentsPage from "@/pages/dashboard/Reports/InstAdmin/InstituteInstallmentsPage";
import InstitutePaymentHistoryPage from "@/pages/dashboard/InstitutePaymentHistoryPage";

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
const INST_ADMIN_ONLY = [ROLES.INST_ADMIN];

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
        <Route path="/latest-courses" element={<LatestCoursesPageForGuest />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/join-us" element={<JoinUsPage />} />
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
        <Route path="/my-certificates" element={<MyCertificates />} />
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
            path="/dashboard/institutes/:instituteId/student/:studentId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <StudentInInstitute />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutes/:instituteId/student/edit/:studentId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <EditStudentInInstitute />
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
                <EditUserData />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/users/:studentId/institutes/:instituteId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
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
          {/* INST_ADMIN ONLY */}
          <Route
            path="/dashboard/billing-dashboard"
            element={
              <DashboardRoute allowed={INST_ADMIN_ONLY}>
                <InstitutionBillingDashboard />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/my-contract"
            element={
              <DashboardRoute allowed={INST_ADMIN_ONLY}>
                <MyContractPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/my-plan"
            element={
              <DashboardRoute allowed={INST_ADMIN_ONLY}>
                <PlanDetailsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/installment-schedule"
            element={
              <DashboardRoute allowed={INST_ADMIN_ONLY}>
                <InstituteInstallmentsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/payments-history"
            element={
              <DashboardRoute allowed={INST_ADMIN_ONLY}>
                <InstitutePaymentHistoryPage />
              </DashboardRoute>
            }
          />
          {/* INST_ADMIN ONLY */}
          <Route
            path="/dashboard/contents/add"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <AddNewContent />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <ContentDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/edit/:contentId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <EditContent />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/add-new-topic"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <AddNewTopic />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/edit-topic/:topicId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <EditTopic />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/topic/:topicId/add-new-lesson"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <AddNewLesson />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/topic/:topicId/edit-lesson/:lessonId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
                <EditLessonData />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contents/:contentId/topics/:topicId/lessons/:lessonId"
            element={
              <DashboardRoute allowed={ALL_ROLES}>
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
          <Route
            path="/dashboard/subscription-plans"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <SubscriptionPlans />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/subscription-plans/:planId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <PlanDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/subscription-plans/add-new-plan"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <AddNewPlan />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/subscription-plans/edit/:planId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <EditPlan />
              </DashboardRoute>
            }
          />
          {/* Institutions Contracts */}
          <Route
            path="/dashboard/institutions-contracts"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <InstitutionsContractsList />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutions-contracts/create"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <CreateAnnualContract />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutions-contracts/edit/:contractId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <EditAnnualContract />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutions-contracts/:contractId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <AnnualContractDetails />
              </DashboardRoute>
            }
          />
          {/* Installments */}
          <Route
            path="/dashboard/installments"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <InstallmentsList />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/installments/:installmentId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <InstallmentDetails />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/institutions-contracts/:contractId/generate-installment"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <GenerateInstallment />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/installments/edit/:installmentId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <EditInstallment />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contract-payments"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <ContractPaymentsList />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contract-payments/:paymentId"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <PaymentDetailsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/contract-payments/:paymentId/cancel"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <CancelPayment />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/installments/:installmentId/create-payment"
            element={
              <DashboardRoute allowed={SUPER_ONLY}>
                <RecordPaymentPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/installments/:installmentId/create-payment/success"
            element={<PaymentSuccessPage />}
          />
          {/* Reports */}
          <Route
            path="/dashboard/reports/settlements"
            element={<AnnualSettlementDashboard />}
          />
          <Route
            path="/dashboard/reports/settlements/:contractId"
            element={<AnnualSettlementDetails />}
          />
          <Route
            path="/dashboard/reports/collections"
            element={<CollectionSummaryPage />}
          />
          <Route
            path="/dashboard/reports/overdue"
            element={<OverdueInstallmentsPage />}
          />
          <Route
            path="/dashboard/reports/upcoming"
            element={<UpcomingPaymentsPage />}
          />
          <Route
            path="/dashboard/reports/payment-percentage"
            element={<PaymentPercentagePage />}
          />
          <Route
            path="/dashboard/reports/discount-tax-report"
            element={<DiscountTaxPage />}
          />
          <Route
            path="/dashboard/reports/administrative-fees"
            element={<AdministrativeFeesPage />}
          />
          <Route
            path="/dashboard/reports/yearly-revenue"
            element={<YearlyRevenuePage />}
          />
          <Route
            path="/dashboard/reports/financial-reports-export"
            element={<FinancialReportsExportPage />}
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
