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
import ContentDetailsPageForGuest from "@/pages/ContentDetailsPageForGuest";
import ContentDetailsPageForUser from "@/pages/ContentDetailsPageForUser";
import LessonPlayerPage from "@/pages/LessonPlayerPage";
import InstituteCourses from "@/pages/InstituteCourses";
import SavedContentsList from "@/pages/SavedContentsList";
import ExpertProfile from "@/pages/ExpertProfile";
import ProgramDetails from "@/pages/ProgramDetails";
import InstituteCourseDetails from "@/pages/InstituteCourseDetails";
import ProtectVerifyOtp from "./ProtectVerifyOtp";
import ProtectResetPassword from "./ProtectResetPassword";
import LatestCoursesPage from "@/pages/LatestCoursesPage";
import SavedLessons from "@/pages/SavedLessons";
import MyNotes from "@/pages/MyNotes";
import CourseMaterials from "@/pages/CourseMaterials";
import ChangePassword from "@/pages/ChangePassword";
import VerifyOtpForForgotPassword from "@/pages/VerifyOtpForForgotPassword";
import SearchResults from "@/pages/SearchResults";
import AboutUs from "@/pages/AboutUs";
import SavedItems from "@/pages/SavedItems";
import QuizPage from "@/pages/QuizPage";
import MyCourses from "@/pages/MyCourses";
import ProfileSettings from "@/pages/ProfileSettings";
import TermsOfUse from "@/pages/TermsOfUse";
import AboutLayout from "@/layouts/AboutLayout/AboutLayout";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import InstitutesPage from "@/pages/dashboard/InstitutesPage";
import DashboardLayout from "@/layouts/DashboardLayout/DashboardLayout";
import AddNewInstitute from "@/pages/dashboard/AddNewInstitute";
import InstituteCoursesDashboard from "@/pages/dashboard/InstituteCoursesDashboard";
import StudentsPage from "@/pages/dashboard/StudentsPage";
import AddNewStudent from "@/pages/dashboard/AddNewStudent";
import EditStudentData from "@/pages/dashboard/EditStudentData";
import StudentDetails from "@/pages/dashboard/StudentDetails";
import InstituteDetails from "@/pages/dashboard/InstituteDetails";
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
export default function AppRoutes() {
  return (
    <Routes>
      {/* Default: redirect root */}
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
      </Route>

      <Route path="/" element={<AboutLayout />}>
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>

      {/* Dashboard */}
      <Route path="/" element={<DashboardLayout />}>
        <Route path="/institutes" element={<InstitutesPage />} />
        <Route path="/add-new-institute" element={<AddNewInstitute />} />
        <Route
          path="/institute-courses"
          element={<InstituteCoursesDashboard />}
        />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/add-new-student" element={<AddNewStudent />} />
        <Route path="/edit-student/:studentId" element={<EditStudentData />} />
        <Route
          path="/student-details/:studentId"
          element={<StudentDetails />}
        />
        <Route path="/institute/:instituteId" element={<InstituteDetails />} />
        <Route path="/programs" element={<AdminProgramsList />} />
        <Route
          path="/admin-program-details/:programId"
          element={<AdminProgramDetails />}
        />
        <Route path="/add-new-program" element={<AddNewProgram />} />
        <Route
          path="/edit-program/:programId"
          element={<EditProgramDetails />}
        />
        <Route path="/dashboard-courses" element={<CoursesDashboardPage />} />
        <Route path="/dashboard-add-new-course" element={<AddNewCourse />} />
        <Route
          path="/dashboard-edit-course/:courseId"
          element={<EditCourseDetails />}
        />
        <Route
          path="/dashboard/course/:courseId"
          element={<CourseDetailsDashboard />}
        />
        <Route
          path="/dashboard/learning-paths"
          element={<LearningPathsDashboard />}
        />
        <Route
          path="/dashboard/add-learning-path"
          element={<AddNewLearningPath />}
        />
        <Route
          path="/dashboard/edit-learning-path/:learningPathId"
          element={<EditLearningPath />}
        />
        <Route
          path="/dashboard/learning-path/:learningPathId"
          element={<LearningPathDashboard />}
        />
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

      {/* Public Routes with MainLayout */}
      <Route
        element={
          <PublicOnlyRoute>
            <MainLayout />
          </PublicOnlyRoute>
        }
      >
        <Route
          path="/guest-course-details/:courseId"
          element={<ContentDetailsPageForGuest />}
        />
        <Route index element={<GuestHome />} />
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

      {/* Not Found */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
