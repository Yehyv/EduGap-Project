import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import LogoSm from "@/assets/svgs/EduGapWithShadow.svg?react";
import CloseIcon from "@/assets/svgs/CloseIcon.svg?react";
import DashboardIcon from "@/assets/svgs/DashboardIcon.svg?react";
import GovernmentIcon from "@/assets/svgs/GovernmentIcon.svg?react";
import StudentIcon from "@/assets/svgs/studentSidebarIcon.svg?react";
import SystemUsersIcon from "@/assets/svgs/SystemUsersIcon.svg?react";
import CoursesDashboardIcon from "@/assets/svgs/CoursesDashboardIcon.svg?react";
import ProgramsIcon from "@/assets/svgs/ProgramsIcon.svg?react";
import LearningPathsIcon from "@/assets/svgs/LearningPaths.svg?react";
import EducatorsIcon from "@/assets/svgs/educatorsIcon.svg?react";
import ConentsIcon from "@/assets/svgs/contentIcon.svg?react";
import LogoutIcon from "@/assets/svgs/LogoutIcon.svg?react";
import LocationIcon from "@/assets/svgs/LocationIcon.svg?react";
import SettingSidebarIcon from "@/assets/svgs/SettingSidebarIcon.svg?react";
import SearchBar from "@/features/Dashboard/components/SearchBar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { logoutDashboardUser } from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import ProfileSection from "@/features/Dashboard/components/ProfileSection";

// ─────────────────────────────────────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  INST_ADMIN: "INST_ADMIN",
};

const ALL_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.INST_ADMIN];
const SUPER_AND_ADMIN = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const SUPER_ONLY = [ROLES.SUPER_ADMIN];

// ─────────────────────────────────────────────────────────────────────────────
// NAV LINK CLASS
// ─────────────────────────────────────────────────────────────────────────────
const navLinkClass = ({ isActive }) =>
  `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
  ${
    isActive
      ? "text-secondary font-bold bg-[#ECF8FF]"
      : "text-[#ACACAC] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
  }`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { dashboardToken, dashboardLogout } = useAuth();
  const navigate = useNavigate();

  // Decode token safely
  const decoded = (() => {
    try {
      return dashboardToken ? jwtDecode(dashboardToken) : null;
    } catch {
      return null;
    }
  })();

  const role = decoded?.role;
  const instituteId = decoded?.instituteId;

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isAdmin = role === ROLES.ADMIN;
  const isInstAdmin = role === ROLES.INST_ADMIN;
  const isSuperOrAdmin = isSuperAdmin || isAdmin;

  const handleLogout = () => {
    logoutDashboardUser()
      .then(() => {
        dashboardLogout();
        navigate("/dashboard/login");
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen gap-2 bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col justify-between
          fixed top-0 h-screen w-64 bg-white z-40 shadow-lg
          transform transition-all duration-300 ease-in-out
          ${lang === "en" ? "left-0" : "right-0"}
          ${
            open
              ? "translate-x-0 opacity-100"
              : lang === "en"
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
          }
          md:translate-x-0 md:opacity-100 md:shadow-none
        `}
      >
        <div>
          <button
            onClick={() => setOpen(false)}
            className="bg-gray-200 cursor-pointer w-7 h-7 center rounded-full absolute end-2 top-2 md:!hidden"
          >
            <CloseIcon className="w-3 h-3" />
          </button>

          {/* Logo */}
          <div className="h-16 flex items-center justify-center">
            <NavLink to="/userHome">
              <LogoSm className="cursor-pointer" />
            </NavLink>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-2 px-3 flex flex-col gap-1 overflow-y-auto flex-1">
          <h5 className="text-[#ACACAC] mb-2 mx-2">{t("menu")}</h5>

          {/* ── ALL roles ─────────────────────────────────────────────────── */}
          <NavLink
            to="/dashboard/home"
            end
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            <DashboardIcon />
            <span>{t("dashboard")}</span>
          </NavLink>

          {/* Institutes:
              SUPER_ADMIN & ADMIN → /dashboard/institutes (list)
              INST_ADMIN          → /dashboard/institutes/:instituteId (their own) */}
          {isSuperOrAdmin && (
            <NavLink
              to="/dashboard/institutes"
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              <GovernmentIcon />
              <span>{t("institutes")}</span>
            </NavLink>
          )}

          {isInstAdmin && instituteId && (
            <NavLink
              to={`/dashboard/institutes/${instituteId}`}
              className={navLinkClass}
              onClick={() => setOpen(false)}
            >
              <GovernmentIcon />
              <span>{t("institutes")}</span>
            </NavLink>
          )}

          {/* Training Courses — ALL roles
              ⚠️ Uses /dashboard/institute-courses to avoid collision
                 with the client-side /institute-courses route */}
          {/* <NavLink
            to="/dashboard/institute-courses"
            className={navLinkClass}
            onClick={() => setOpen(false)}
          >
            <ConentsIcon />
            <span>{t("trainingCourses")}</span>
          </NavLink> */}

          {/* ── SUPER_ADMIN & ADMIN only ──────────────────────────────────── */}
          {isSuperOrAdmin && (
            <>
              <NavLink
                to="/dashboard/users"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <StudentIcon />
                <span>{t("users")}</span>
              </NavLink>

              <NavLink
                to="/dashboard/programs"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <ProgramsIcon />
                <span>{t("nav_programs")}</span>
              </NavLink>

              <NavLink
                to="/dashboard/courses"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <CoursesDashboardIcon />
                <span>{t("courses")}</span>
              </NavLink>

              <NavLink
                to="/dashboard/learning-paths"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <LearningPathsIcon />
                <span>{t("learningPaths")}</span>
              </NavLink>

              <NavLink
                to="/dashboard/experts"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <EducatorsIcon />
                <span>{t("experts")}</span>
              </NavLink>

              <NavLink
                to="/dashboard/contents"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <ConentsIcon />
                <span>{t("contents")}</span>
              </NavLink>

              <NavLink
                to="/dashboard/location"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <LocationIcon />
                <span>{t("location")}</span>
              </NavLink>
            </>
          )}

          {/* ── SUPER_ADMIN only ──────────────────────────────────────────── */}
          {isSuperAdmin && (
            <>
              <NavLink
                to="/dashboard/roles"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <SettingSidebarIcon />
                <span>{t("roles")}</span>
              </NavLink>

              <NavLink
                to="/dashboard/system-users"
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                <SystemUsersIcon />
                <span>{t("systemUsers")}</span>
              </NavLink>
            </>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="pb-10 mx-4 pt-2 flex items-center gap-2 text-[#ACACAC] border-t border-[#ACACAC]"
        >
          <LogoutIcon className="rotate-180" />
          <span>{t("logout")}</span>
        </button>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:me-4 md:ms-64 pt-2">
        {/* Header */}
        <header className="py-2 bg-white rounded-2xl flex items-center mx-6 justify-between px-4">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <SearchBar placeholder={t("search")} lang={lang} />

          <ProfileSection
            userName={""}
            userRole={role}
            userImage={""}
            currentLang={lang}
            onLanguageChange={setLang}
          />
        </header>

        {/* Outlet */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
