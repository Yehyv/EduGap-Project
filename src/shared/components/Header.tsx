import LogoSm from "@/assets/svgs/EduGapWithShadow.svg?react";
import NavListIcon from "@/assets/svgs/NavListIcon.svg?react";
import { Link, useLocation, useNavigate } from "react-router";
import DefaultButton from "./ui/DefaultButton";
import { Suspense, useState, useRef, useCallback } from "react";
import UserNav from "./UserNav";
import { useLanguage } from "../localization/useLanguage";
import SearchBar from "./ui/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  navbarContentsResults,
  navbarExpertsResults,
  navbarInstitutionalSubjectsResults,
  navbarPackagesResults,
  navbarSavedContentsResults,
} from "../services/sharedApis";
import { useUser } from "@/features/auth/context/UserContext";
import CategoriesDropdown from "./EduGap/CategoriesDropdown";
import type {
  ExpertsData,
  InstituteCoursesType,
  ProgramsType,
  savedContentDropdownType,
} from "../types/sharedTypes";
import { useAuth } from "@/features/auth/context/AuthContext";
import LanguageDropdown from "./ui/LanguageDropdown";

// ================= Types =================
type NavKey =
  | "courses"
  | "programs"
  | "experts"
  | "savedContents"
  | "popular"
  | "institutionalSubjects";

interface NavItemConfig {
  key: NavKey;
  labelKey: string;
  path: string;
}

type DropdownHandlers = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

// ================= Shared Dropdown Styles =================
const DROPDOWN_BASE =
  "absolute top-full end-0 bg-white shadow-2xl rounded-2xl p-2 min-w-[260px] z-50 max-h-[60vh] overflow-y-auto border border-gray-100/80 dropdown-scroll";

const dropdownAnimation = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
  transition: { duration: 0.14, ease: "easeOut" },
};

const DROPDOWN_ITEM_CLASS =
  "flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors duration-100";

// ================= Generic Dropdown =================
const Dropdown = ({
  data,
  linkPrefix,
  onMouseEnter,
  onMouseLeave,
}: {
  data: ExpertsData[];
  linkPrefix: string;
} & DropdownHandlers) => {
  const { t } = useLanguage();
  return (
    <motion.div
      {...dropdownAnimation}
      style={{ transformOrigin: "top center" }}
      className={DROPDOWN_BASE}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {data?.map((item) => (
        <Link
          key={item.id}
          to={`${linkPrefix}/${item.id}`}
          className={DROPDOWN_ITEM_CLASS}
        >
          <img
            src={item.image}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-200"
          />
          <div className="flex flex-col leading-tight min-w-0">
            {item?.user?.full_name && (
              <span className="font-semibold text-sm text-gray-800 truncate">
                {item.user.full_name}
              </span>
            )}
            <span className="text-sm text-gray-500 truncate">{item.title}</span>
          </div>
        </Link>
      ))}
      {data?.length === 0 && (
        <p className="text-gray-400 text-sm text-center w-full py-4">
          {t("no_data_available")}
        </p>
      )}
    </motion.div>
  );
};

// ================= Programs Dropdown =================
const ProgramsDropdown = ({
  data,
  onMouseEnter,
  onMouseLeave,
}: { data: ProgramsType[] } & DropdownHandlers) => (
  <motion.div
    {...dropdownAnimation}
    style={{ transformOrigin: "top center" }}
    className={`${DROPDOWN_BASE} min-w-[260px]`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {data?.map((item) => (
      <Link
        key={item.id}
        to={`/program-details/${item.id}`}
        className={DROPDOWN_ITEM_CLASS}
      >
        <img
          src={item.image}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-200"
        />
        <div className="leading-tight min-w-0">
          <span className="text-sm font-medium text-gray-800 line-clamp-2">
            {item.title}
          </span>
        </div>
      </Link>
    ))}
  </motion.div>
);

// ================= Saved Contents Dropdown =================
const SavedContentsDropdown = ({
  data,
  t,
  onMouseEnter,
  onMouseLeave,
}: {
  data?: { items: savedContentDropdownType[] };
  t: (key: string) => string;
} & DropdownHandlers) => (
  <motion.div
    {...dropdownAnimation}
    style={{ transformOrigin: "top center" }}
    className={`${DROPDOWN_BASE} min-w-[300px]`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {data?.items?.map((item: savedContentDropdownType) => (
      <Link
        key={item.id}
        to={`/user-course-details/${item.id}`}
        className={DROPDOWN_ITEM_CLASS}
      >
        <img
          src={item.image}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-200"
        />
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-semibold text-sm text-gray-800 truncate">
            {item?.name}
          </span>
          {item?.instructor && (
            <span className="text-xs text-gray-400 truncate">
              {item.instructor.title} / {item.instructor.name}
            </span>
          )}
        </div>
      </Link>
    ))}
    {data?.items?.length === 0 && (
      <p className="text-gray-400 text-sm text-center w-full py-4">
        {t("no_data_available")}
      </p>
    )}
  </motion.div>
);

// ================= Institutional Subjects Dropdown =================
const InstitutionalSubjectsDropdown = ({
  data,
  t,
  onMouseEnter,
  onMouseLeave,
}: {
  data?: InstituteCoursesType[];
  t: (key: string) => string;
} & DropdownHandlers) => (
  <motion.div
    {...dropdownAnimation}
    style={{ transformOrigin: "top center" }}
    className={`${DROPDOWN_BASE} min-w-[300px]`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {data?.map((item: InstituteCoursesType) => (
      <Link
        key={item.id}
        to={`/user-course-details/${item.id}`}
        className={DROPDOWN_ITEM_CLASS}
      >
        <img
          src={item.image}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-200"
        />
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-semibold text-sm text-gray-800 truncate">
            {item?.name}
          </span>
        </div>
      </Link>
    ))}
    {data?.length === 0 && (
      <p className="text-gray-400 text-sm text-center w-full py-4">
        {t("no_data_available")}
      </p>
    )}
  </motion.div>
);

// ================= Desktop Nav Item =================
const DesktopNavItem = ({
  item,
  activeKey,
  setActiveKey,
  data,
  t,
  renderDropdown,
  sharedLeaveTimer, // ← shared across ALL nav items — this is the core fix
}: {
  item: NavItemConfig;
  activeKey: NavKey | null;
  setActiveKey: (key: NavKey | null) => void;
  data?: unknown;
  t: (key: string) => string;
  renderDropdown?: (handlers: DropdownHandlers) => React.ReactNode | null;
  sharedLeaveTimer: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>;
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const isOpen = activeKey === item.key;

  // Cancel any pending close — works across items because the ref is shared
  const cancelClose = useCallback(() => {
    if (sharedLeaveTimer.current) {
      clearTimeout(sharedLeaveTimer.current);
      sharedLeaveTimer.current = null;
    }
  }, [sharedLeaveTimer]);

  // Schedule close — 100 ms grace period so mouse can travel into the dropdown
  const scheduleClose = useCallback(() => {
    cancelClose();
    sharedLeaveTimer.current = setTimeout(() => setActiveKey(null), 100);
  }, [cancelClose, setActiveKey]);

  const handleTriggerEnter = useCallback(() => {
    cancelClose();
    setActiveKey(item.key);
  }, [cancelClose, item.key, setActiveKey]);

  // Passed into each dropdown so hovering inside it also cancels the close timer
  const dropdownHandlers: DropdownHandlers = {
    onMouseEnter: cancelClose,
    onMouseLeave: scheduleClose,
  };

  return (
    <div
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={scheduleClose}
      className="relative py-3"
    >
      <Link
        to={item.path}
        className={`relative cursor-pointer py-1 xl:text-base font-medium transition-colors duration-150 ${
          isActive ? "text-secondary" : "text-black hover:text-secondary"
        }`}
      >
        {t(item.labelKey)}
        {/* Active underline */}
        <span
          className={`absolute -bottom-0.5 start-0 end-0 h-0.5 rounded-full bg-secondary transition-all duration-200 ${
            isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
        />
      </Link>

      <AnimatePresence>
        {isOpen && data && renderDropdown?.(dropdownHandlers)}
      </AnimatePresence>
    </div>
  );
};

// ================= Mobile Nav Item =================
const MobileNavItem = ({
  item,
  t,
  onClick,
}: {
  item: NavItemConfig;
  t: (key: string) => string;
  onClick: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`font-medium px-4 py-3 flex items-center gap-2 rounded-xl transition-all duration-150 ${
        isActive
          ? "text-secondary font-semibold"
          : "text-black hover:bg-secondary/80 hover:text-white"
      }`}
    >
      {t(item.labelKey)}
    </Link>
  );
};

// ================= Header =================
const Header = ({
  isLoggedIn = false,
  color,
}: {
  isLoggedIn?: boolean;
  color?: string;
}) => {
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<NavKey | null>(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const { token } = useAuth();

  // ── ONE shared timer for ALL DesktopNavItems ───────────────────────────────
  // Previously each item had its own ref, so moving from item A → item B
  // couldn't cancel item A's timer → dropdown got "stuck" closed or flickered.
  const sharedLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ================= Nav Items =================
  const NAV_ITEMS: NavItemConfig[] = token
    ? [
        { key: "courses", labelKey: "courses", path: "/latest-courses" },
        { key: "programs", labelKey: "programs", path: "/programs-list" },
        {
          key: "institutionalSubjects",
          labelKey: "institutionalSubjects",
          path: "/institute-courses",
        },
        {
          key: "savedContents",
          labelKey: "saved_contents",
          path: "/saved-items?tab=courses",
        },
      ]
    : [
        { key: "courses", labelKey: "courses", path: "/latest-courses" },
        { key: "programs", labelKey: "programs", path: "/programs-list" },
        { key: "experts", labelKey: "experts", path: "/experts-list" },
      ];

  // ================= Queries =================
  const { data: coursesData } = useQuery({
    queryKey: ["coursesNav", user?.programId],
    queryFn: () => navbarContentsResults(user?.programId ?? 0),
  });
  const { data: programsData } = useQuery({
    queryKey: ["programsNav"],
    queryFn: navbarPackagesResults,
  });
  const { data: expertsData } = useQuery({
    queryKey: ["expertsNav"],
    queryFn: () => navbarExpertsResults(1),
  });
  const { data: institutionalSubjectsData } = useQuery({
    queryKey: ["institutionalSubjects"],
    queryFn: () => navbarInstitutionalSubjectsResults(user?.programId ?? 0),
    enabled: !!user?.programId,
  });
  const { data: savedContentData } = useQuery({
    queryKey: ["savedContentsNav"],
    queryFn: navbarSavedContentsResults,
    enabled: !!user?.programId,
  });

  // ================= Data + Renderer Maps =================
  const dataMap: Record<NavKey, unknown> = {
    courses: coursesData,
    programs: programsData,
    experts: expertsData,
    savedContents: savedContentData,
    institutionalSubjects: institutionalSubjectsData,
    popular: undefined,
  };

  const dropdownRenderers: Partial<
    Record<NavKey, (h: DropdownHandlers) => React.ReactNode>
  > = {
    courses: (h) =>
      coursesData ? (
        <CategoriesDropdown categories={coursesData} {...h} />
      ) : null,

    programs: (h) =>
      programsData ? <ProgramsDropdown data={programsData} {...h} /> : null,

    experts: (h) =>
      expertsData ? (
        <Dropdown data={expertsData} linkPrefix="/expert" {...h} />
      ) : null,

    savedContents: (h) => (
      <SavedContentsDropdown data={savedContentData} t={t} {...h} />
    ),

    institutionalSubjects: (h) => (
      <InstitutionalSubjectsDropdown
        data={institutionalSubjectsData}
        t={t}
        {...h}
      />
    ),
  };

  return (
    <>
      <style>{`
        .dropdown-scroll::-webkit-scrollbar             { width: 4px; }
        .dropdown-scroll::-webkit-scrollbar-track       { background: transparent; }
        .dropdown-scroll::-webkit-scrollbar-thumb       { background: #e5e7eb; border-radius: 99px; }
        .dropdown-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      <header
        className={`bg-${color ?? "primary"} py-2 z-50 sticky -top-1 start-0 end-0 shadow-md`}
      >
        <div className="container mx-auto flex items-center justify-between gap-3 px-4">
          {/* ── Logo ── bigger, high-quality SVG at 52 px tall ─────────── */}
          <Link
            to="/userHome"
            className="flex-shrink-0 flex items-center"
            aria-label="Home"
          >
            <LogoSm
              className="cursor-pointer w-auto transition-opacity duration-150 hover:opacity-90"
              style={{ height: "52px" }}
            />
          </Link>

          {/* ── Search — desktop ─────────────────────────────────────── */}
          <SearchBar
            placeholder={t("search_placeholder")}
            lang={lang}
            className="sm:max-w-sm mx-auto max-lg:hidden flex-1"
          />

          {/* ── Desktop Nav ──────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-5 relative text-nowrap">
            {NAV_ITEMS.map((item) => (
              <DesktopNavItem
                key={item.key}
                item={item}
                activeKey={desktopDropdown}
                setActiveKey={setDesktopDropdown}
                data={dataMap[item.key]}
                renderDropdown={dropdownRenderers[item.key]}
                sharedLeaveTimer={sharedLeaveTimer}
                t={t}
              />
            ))}
          </nav>

          {/* ── Right side — guest (desktop) ─────────────────────────── */}
          {!isLoggedIn && (
            <div className="hidden lg:flex gap-3 items-center ms-1">
              <Suspense
                fallback={
                  <div className="w-16 h-4 bg-white/20 rounded animate-pulse" />
                }
              >
                <LanguageDropdown currentLang={lang} onChange={setLang} />
              </Suspense>
              <DefaultButton
                type="button"
                text={t("auth_login")}
                moreStyle="px-5 !py-1.5 text-sm font-semibold !rounded-xl"
                onClick={() => navigate("/login")}
              />
            </div>
          )}

          {/* ── User avatar + mobile hamburger ───────────────────────── */}
          <div className="flex items-center gap-3">
            {isLoggedIn && <UserNav />}

            {!isLoggedIn && (
              <div className="lg:hidden flex items-center gap-2">
                <Suspense fallback={null}>
                  <LanguageDropdown currentLang={lang} onChange={setLang} />
                </Suspense>
              </div>
            )}

            <button
              className="lg:hidden cursor-pointer flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <NavListIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div
                className={`bg-${color ?? "primary"} px-4 pt-2 pb-5 border-t border-white/10`}
              >
                <div className="py-3">
                  <SearchBar
                    placeholder={t("search_placeholder")}
                    lang={lang}
                    className="w-full"
                  />
                </div>

                <nav className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <MobileNavItem
                      key={item.key}
                      item={item}
                      t={t}
                      onClick={() => setMenuOpen(false)}
                    />
                  ))}

                  {!isLoggedIn && (
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="font-semibold px-4 py-3 mt-2 flex items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 transition-colors"
                    >
                      {t("auth_login")}
                    </Link>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
