import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import NavListIcon from "@/assets/svgs/NavListIcon.svg?react";
import { Link, useLocation, useNavigate } from "react-router";
import DefaultButton from "./ui/DefaultButton";
import { useState } from "react";
import UserNav from "./UserNav";
import { useLanguage } from "../localization/useLanguage";
import SearchBar from "./ui/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  navbarContentsResults,
  navbarExpertsResults,
  navbarPackagesResults,
  navbarSavedContentsResults,
} from "../services/sharedApis";
import { useUser } from "@/features/auth/context/UserContext";
import CategoriesDropdown from "./EduGap/CategoriesDropdown";
import type {
  ExpertsData,
  ProgramsType,
  savedContentDropdownType,
} from "../types/sharedTypes";

// ================= Types =================
type NavKey = "courses" | "programs" | "experts" | "savedContents";

interface NavItemConfig {
  key: NavKey;
  labelKey: string;
  path: string;
}

// ================= Constants =================
const NAV_ITEMS: NavItemConfig[] = [
  { key: "courses", labelKey: "courses", path: "/latest-courses" },
  { key: "programs", labelKey: "programs", path: "/programs-list" },
  { key: "experts", labelKey: "experts", path: "/experts-list" },
  { key: "savedContents", labelKey: "saved_contents", path: "/saved-contents" },
];

const dropdownAnimation = {
  initial: { opacity: 0, y: -10, scaleY: 0.85 },
  animate: { opacity: 1, y: 0, scaleY: 1 },
  exit: { opacity: 0, y: -10, scaleY: 0.85 },
  transition: { duration: 0.2 },
};

// ================= Generic Dropdown =================
const Dropdown = ({
  data,
  linkPrefix,
}: {
  data: ExpertsData[];
  linkPrefix: string;
}) => (
  <motion.div
    {...dropdownAnimation}
    className="absolute top-full end-0 bg-white shadow-lg rounded-xl p-3 min-w-[250px] z-40"
  >
    {data.map((item) => (
      <Link
        key={item.id}
        to={`${linkPrefix}/${item.id}`}
        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition"
      >
        <img src={item.image} className="w-10 h-10 rounded-md object-cover" />
        <div className="flex flex-col leading-tight">
          {item?.user?.full_name && (
            <span className="font-semibold">{item.user.full_name}</span>
          )}
          <span className="">{item.title}</span>
        </div>
      </Link>
    ))}
  </motion.div>
);

// ================= Programs Dropdown =================
const ProgramsDropdown = ({ data }: { data: ProgramsType[] }) => (
  <motion.div
    {...dropdownAnimation}
    className="absolute top-full end-0 bg-white shadow-lg rounded-xl p-3 min-w-[250px] z-40"
  >
    {data?.map((item) => (
      <Link
        key={item.id}
        to={`/program-details/${item.id}`}
        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition"
      >
        <img src={item.image} className="w-10 h-10 rounded-md object-cover" />
        <div className="leading-tight">
          <span>{item.title}</span>
        </div>
      </Link>
    ))}
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
}: {
  item: NavItemConfig;
  activeKey: NavKey | null;
  setActiveKey: (key: NavKey | null) => void;
  data?: any;
  t: (key: "courses" | "programs" | "saved_contents" | "experts") => string;
  renderDropdown?: () => React.ReactNode | null;
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <div
      onMouseEnter={() => setActiveKey(item.key)}
      onMouseLeave={() => setActiveKey(null)}
      className="relative py-3"
    >
      <Link
        to={item.path}
        className={`cursor-pointer py-3 xl:text-lg ${
          isActive ? "text-secondary font-semibold" : ""
        }`}
      >
        {t(item?.labelKey)}
      </Link>

      <AnimatePresence>
        {activeKey === item.key && data && renderDropdown?.()}
      </AnimatePresence>
    </div>
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
  const { t, lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<NavKey | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  // ===== Queries =====
  const { data: coursesData } = useQuery({
    queryKey: ["coursesNav", user?.programId],
    queryFn: () => navbarContentsResults(user!.programId),
    enabled: !!user?.programId,
  });

  const { data: programsData } = useQuery({
    queryKey: ["programsNav"],
    queryFn: navbarPackagesResults,
  });

  const { data: expertsData } = useQuery({
    queryKey: ["expertsNav"],
    queryFn: () => navbarExpertsResults(1),
  });

  const { data: savedContentData } = useQuery({
    queryKey: ["savedContentsNav"],
    queryFn: navbarSavedContentsResults,
  });

  return (
    <header
      className={`bg-${
        color ?? "primary"
      } py-2 z-50 sticky -top-1 start-0 end-0`}
    >
      <div className="container mx-auto flex items-center justify-between gap-2 px-4">
        <Link to="/userHome">
          <LogoSm className="cursor-pointer" />
        </Link>

        <SearchBar
          placeholder={t("search_placeholder")}
          lang={lang}
          className="sm:max-w-md mx-auto max-lg:hidden"
        />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-3 relative text-nowrap">
          {NAV_ITEMS.map((item) => {
            const dataMap = {
              courses: coursesData,
              programs: programsData,
              experts: expertsData,
              savedContents: savedContentData,
            };

            const dropdownRenderers = {
              courses: () =>
                coursesData ? (
                  <CategoriesDropdown categories={coursesData} />
                ) : (
                  <></>
                ),
              programs: () =>
                programsData ? <ProgramsDropdown data={programsData} /> : <></>,
              experts: () =>
                expertsData ? (
                  <Dropdown data={expertsData} linkPrefix="/expert" />
                ) : (
                  <></>
                ),
              savedContents: () => (
                <motion.div
                  {...dropdownAnimation}
                  className="absolute top-full end-0 bg-white shadow-lg rounded-xl p-3 min-w-[300px] z-40"
                >
                  {savedContentData?.items?.map(
                    (item: savedContentDropdownType) => (
                      <Link
                        key={item.id}
                        to={`/user-course-details/${item.id}`}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition"
                      >
                        <img
                          src={item.image}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold">{item?.name}</span>
                          {item?.instructor && (
                            <span className="text-[12px] text-gray-400">
                              {item.instructor.title} / {item.instructor.name}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  )}
                </motion.div>
              ),
            };

            return (
              <DesktopNavItem
                key={item.key}
                item={item}
                activeKey={desktopDropdown}
                setActiveKey={setDesktopDropdown}
                data={dataMap[item.key]}
                renderDropdown={dropdownRenderers[item.key]}
                t={t}
              />
            );
          })}
        </nav>

        {!isLoggedIn && (
          <div className="hidden lg:flex gap-4 items-center">
            <DefaultButton
              type="button"
              text={t("auth_login")}
              moreStyle="px-6 !py-1"
              onClick={() => navigate("/login")}
            />
          </div>
        )}

        <div className="flex gap-4">
          {isLoggedIn && <UserNav />}
          <button
            className="lg:hidden cursor-pointer flex items-center p-1"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <NavListIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden bg-primary px-4 mt-2 py-4"
          >
            <nav className="flex flex-col gap-2">
              <div className="lg:hidden py-2 center">
                <SearchBar
                  placeholder={t("search_placeholder")}
                  lang={lang}
                  className="max-w-md"
                />
              </div>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`font-semibold px-5 py-2 block hover:bg-white rounded-xl ${
                    location.pathname === item.path
                      ? "text-secondary bg-white"
                      : ""
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>

            {!isLoggedIn && <Link to="/login">{t("auth_login")}</Link>}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
