import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import LogoSm from "@/assets/svgs/EduGapWithShadow.svg?react";
import LogoIcon from "@/assets/imgs/LogoIcon.png";
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
import {
  DollarSign,
  FileSignature,
  FileText,
  ListChecks,
  PackageCheck,
  ChevronDown,
  ChevronRight,
  BarChart2,
  PanelLeftClose,
  PanelLeftOpen,
  BadgeDollarSignIcon,
  ClockAlert,
  CalendarClock,
  PieChart,
  Tag,
  FileCog,
  TrendingUp,
  Download,
  LayoutDashboardIcon,
  Package,
  CalendarRange,
  History,
  CalendarClockIcon,
  Calculator,
  Receipt,
  ArrowUpCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  INST_ADMIN: "INST_ADMIN",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { dashboardToken, dashboardLogout, instAdminInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────────
  // NAV LINK CLASS
  // ─────────────────────────────────────────────────────────────────────────────
  const navLinkClass = ({ isActive }) =>
    `p-2 flex items-center gap-2 ${collapsed ? "justify-center" : ""} rounded-xl text-sm transition-all
  ${
    isActive
      ? "text-secondary font-bold bg-[#ECF8FF]"
      : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
  }`;

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

  // Keep reports open if a reports route is active
  const isReportsActive = location.pathname.startsWith("/dashboard/reports");

  const handleLogout = () => {
    logoutDashboardUser()
      .then(() => {
        dashboardLogout();
        navigate("/dashboard/login");
      })
      .catch(console.error);
  };

  // Sidebar width classes
  const sidebarW = collapsed ? "w-[68px]" : "w-64";
  const mainML = collapsed ? "md:ms-[68px]" : "md:ms-64";

  return (
    <div className="min-h-screen gap-2 bg-gray-50">
      {/* ── Sidebar ── */}
      <aside
        className={`
          flex flex-col justify-between
          fixed top-0 h-screen bg-white z-40 shadow-lg
          transform transition-all duration-300 ease-in-out
          ${sidebarW}
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
          {/* Mobile close button */}
          <button
            onClick={() => setOpen(false)}
            className="bg-gray-200 cursor-pointer w-7 h-7 center rounded-full absolute end-2 top-2 md:!hidden"
          >
            <CloseIcon className="w-3 h-3" />
          </button>

          {/* Logo + collapse toggle */}
          <div className="flex flex-col items-center justify-center py-4 gap-3">
            <NavLink to="/dashboard/home">
              {collapsed ? (
                <img src={LogoIcon} alt="logo" className="w-8"></img>
              ) : (
                <LogoSm className="cursor-pointer" />
              )}
            </NavLink>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex absolute -end-3 top-12 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-400 hover:text-secondary hover:border-secondary transition-colors z-10"
              title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            >
              {collapsed ? (
                <PanelLeftOpen size={13} />
              ) : (
                <PanelLeftClose size={13} />
              )}
            </button>

            {!collapsed && role === ROLES.INST_ADMIN && instAdminInfo && (
              <div className="flex flex-col items-center gap-2 w-full px-3">
                <div className="w-full h-px bg-gray-200" />
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center bg-white flex-shrink-0">
                  <img
                    src={instAdminInfo.logo}
                    alt={instAdminInfo.instituteName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p
                  className="font-medium text-center text-gray-600 leading-tight line-clamp-2 w-full"
                  title={instAdminInfo.instituteName}
                  dir="auto"
                >
                  {instAdminInfo.instituteName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="py-2 px-2 flex flex-col gap-1 overflow-y-auto flex-1">
          {!collapsed && (
            <h5 className="text-[#575757] mb-2 mx-2 text-sm">{t("menu")}</h5>
          )}

          {/* ── ALL roles ── */}
          <NavLink
            to="/dashboard/home"
            end
            className={navLinkClass}
            onClick={() => setOpen(false)}
            title={collapsed ? t("dashboard") : undefined}
          >
            <DashboardIcon className="flex-shrink-0" />
            {!collapsed && <span>{t("dashboard")}</span>}
          </NavLink>

          {isSuperOrAdmin && (
            <NavLink
              to="/dashboard/institutes"
              className={navLinkClass}
              onClick={() => setOpen(false)}
              title={collapsed ? t("institutes") : undefined}
            >
              <GovernmentIcon className="flex-shrink-0" />
              {!collapsed && <span>{t("institutes")}</span>}
            </NavLink>
          )}

          {isInstAdmin && instituteId && (
            <NavLink
              to={`/dashboard/institutes/${instituteId}`}
              className={navLinkClass}
              onClick={() => setOpen(false)}
              title={collapsed ? t("institutes") : undefined}
            >
              <GovernmentIcon className="flex-shrink-0" />
              {!collapsed && <span>{t("institutes")}</span>}
            </NavLink>
          )}

          <NavLink
            to="/dashboard/contents"
            className={navLinkClass}
            onClick={() => setOpen(false)}
            title={collapsed ? t("trainingCourses") : undefined}
          >
            <ConentsIcon className="flex-shrink-0" />
            {!collapsed && <span>{t("trainingCourses")}</span>}
          </NavLink>

          {isInstAdmin && (
            <>
              <h5 className="text-[#575757] my-2 mx-2 text-sm">
                {t("billing")}
              </h5>

              <NavLink
                to="/dashboard/billing-dashboard"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("billingDashboard")}
              >
                <LayoutDashboardIcon className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("billingDashboard")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/my-contract"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("myContract")}
              >
                <FileText className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("myContract")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/my-plan"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("myPlan")}
              >
                <Package className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("myPlan")}</span>}
              </NavLink>
              <NavLink
                to="/dashboard/installment-schedule"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("installmentSchedule")}
              >
                <CalendarRange className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("installmentSchedule")}</span>}
              </NavLink>
              <NavLink
                to="/dashboard/payments-history"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("paymentsHistory")}
              >
                <History className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("paymentsHistory")}</span>}
              </NavLink>
              <NavLink
                to="/dashboard/next-installment"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("nextInstallment")}
              >
                <CalendarClockIcon className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("nextInstallment")}</span>}
              </NavLink>
              <NavLink
                to="/dashboard/settlement-summary"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("settlementSummary")}
              >
                <Calculator className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("settlementSummary")}</span>}
              </NavLink>
              <NavLink
                to="/dashboard/payment-proof"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("paymentProof")}
              >
                <Receipt className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("paymentProof")}</span>}
              </NavLink>
              <NavLink
                to="/dashboard/upgrade-plan"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={t("upgradePlan")}
              >
                <TrendingUp className="flex-shrink-0 text-[#ACACAC]" />
                {!collapsed && <span>{t("upgradePlan")}</span>}
              </NavLink>
            </>
          )}

          {/* ── SUPER_ADMIN & ADMIN only ── */}
          {isSuperOrAdmin && (
            <>
              <NavLink
                to="/dashboard/users"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("users") : undefined}
              >
                <StudentIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("users")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/programs"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("nav_programs") : undefined}
              >
                <ProgramsIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("nav_programs")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/courses"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("courses") : undefined}
              >
                <CoursesDashboardIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("courses")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/learning-paths"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("learningPaths") : undefined}
              >
                <LearningPathsIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("learningPaths")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/experts"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("experts") : undefined}
              >
                <EducatorsIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("experts")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/location"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("location") : undefined}
              >
                <LocationIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("location")}</span>}
              </NavLink>
            </>
          )}

          {/* ── SUPER_ADMIN only ── */}
          {isSuperAdmin && (
            <>
              <NavLink
                to="/dashboard/roles"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("roles") : undefined}
              >
                <SettingSidebarIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("roles")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/system-users"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("systemUsers") : undefined}
              >
                <SystemUsersIcon className="flex-shrink-0" />
                {!collapsed && <span>{t("systemUsers")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/subscription-plans"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("Subscription_plans") : undefined}
              >
                <PackageCheck className="text-[#ACACAC] flex-shrink-0" />
                {!collapsed && <span>{t("Subscription_plans")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/institutions-contracts"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("institutions_contracts") : undefined}
              >
                <FileSignature className="text-[#ACACAC] flex-shrink-0" />
                {!collapsed && <span>{t("institutions_contracts")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/installments"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("installments") : undefined}
              >
                <ListChecks className="text-[#ACACAC] flex-shrink-0" />
                {!collapsed && <span>{t("installments")}</span>}
              </NavLink>

              <NavLink
                to="/dashboard/contract-payments"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("payments") : undefined}
              >
                <DollarSign className="text-[#ACACAC] flex-shrink-0" />
                {!collapsed && <span>{t("payments")}</span>}
              </NavLink>
              <NavLink
                to="/dashboard/upgrade-plan-requests"
                className={navLinkClass}
                onClick={() => setOpen(false)}
                title={collapsed ? t("planUpgradeRequests") : undefined}
              >
                <ArrowUpCircle className="text-[#ACACAC] flex-shrink-0" />
                {!collapsed && <span>{t("planUpgradeRequests")}</span>}
              </NavLink>

              {/* ── Reports accordion ── */}
              {collapsed ? (
                // Collapsed: just the icon, clicking navigates directly to annual settlement
                <>
                  <NavLink
                    to="/dashboard/reports/settlements"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("reports")}
                  >
                    <BarChart2 className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/collections"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("collections")}
                  >
                    <BadgeDollarSignIcon className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/overdue"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("overdue")}
                  >
                    <ClockAlert className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/upcoming"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("upcoming")}
                  >
                    <CalendarClock className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/payment-percentage"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("paymentPercentage")}
                  >
                    <PieChart className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/discount-tax-report"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("discountAndTax")}
                  >
                    <Tag className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/administrative-fees"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("administrativeFees")}
                  >
                    <FileCog className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/yearly-revenue"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("yearlyRevenue")}
                  >
                    <TrendingUp className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                  <NavLink
                    to="/dashboard/reports/financial-reports-export"
                    className={navLinkClass}
                    onClick={() => setOpen(false)}
                    title={t("exportFinancialReports")}
                  >
                    <Download className="text-[#ACACAC] flex-shrink-0" />
                  </NavLink>
                </>
              ) : (
                <div className="flex flex-col">
                  {/* Reports toggle button */}
                  <button
                    type="button"
                    onClick={() => setReportsOpen((v) => !v)}
                    className={`p-2 flex items-center gap-2 rounded-xl text-sm transition-all w-full
                      ${
                        isReportsActive
                          ? "text-secondary font-bold bg-[#ECF8FF]"
                          : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                      }`}
                  >
                    <BarChart2
                      className={`flex-shrink-0 ${isReportsActive ? "text-secondary" : "text-[#ACACAC]"}`}
                      size={18}
                    />
                    <span className="flex-1 text-start">{t("reports")}</span>
                    <span
                      className="transition-transform duration-200"
                      style={{
                        transform:
                          reportsOpen || isReportsActive
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                      }}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </button>

                  {/* Sub-links */}
                  <div
                    className="overflow-hidden transition-all duration-200 ease-in-out"
                    style={{
                      maxHeight:
                        reportsOpen || isReportsActive ? "350px" : "0px",
                      opacity: reportsOpen || isReportsActive ? 1 : 0,
                    }}
                  >
                    <div className="ms-4 mt-0.5 flex flex-col gap-0.5 border-s-2 border-gray-100 ps-2">
                      <NavLink
                        to="/dashboard/reports/settlements"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <FileText
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("annualSettlement")}</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/reports/collections"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <BadgeDollarSignIcon
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("collectionsSummary")}</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/reports/overdue"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <ClockAlert
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("collectionOverdue")}</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/reports/upcoming"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <CalendarClock
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("collectionUpcoming")}</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/reports/payment-percentage"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <PieChart
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("paymentPercentage")}</span>
                      </NavLink>

                      <NavLink
                        to="/dashboard/reports/discount-tax-report"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <Tag
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("discountAndTax")}</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/reports/administrative-fees"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <FileCog
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("administrativeFees")}</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/reports/yearly-revenue"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <TrendingUp
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("yearlyRevenue")}</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/reports/financial-reports-export"
                        className={({ isActive }) =>
                          `p-2 flex items-center gap-2 rounded-xl text-sm transition-all
                          ${
                            isActive
                              ? "text-secondary font-bold bg-[#ECF8FF]"
                              : "text-[#575757] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
                          }`
                        }
                        onClick={() => setOpen(false)}
                      >
                        <Download
                          size={13}
                          className="flex-shrink-0 text-[#ACACAC]"
                        />
                        <span>{t("financialReportsExport")}</span>
                      </NavLink>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`pb-10 mx-4 pt-2 flex items-center gap-2 text-[#ACACAC] border-t border-[#ACACAC] ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? t("logout") : undefined}
        >
          <LogoutIcon className="rotate-180 flex-shrink-0" />
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </aside>

      {/* ── Main Area ── */}
      <div
        className={`flex-1 flex flex-col min-h-screen ml-0 md:me-4 ${mainML} pt-2 transition-all duration-300`}
      >
        {/* Header */}
        <header
          className={`sticky top-0 z-30 py-2 rounded-2xl flex items-center mx-6 justify-between px-4 transition-all duration-200 ${
            scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-white"
          }`}
        >
          {" "}
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
            userRole={role}
            userImage={instAdminInfo?.userImage}
            currentLang={lang}
            onLanguageChange={setLang}
            userName={instAdminInfo?.userName}
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
