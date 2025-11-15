import LogoSm from "@/assets/svgs/LogoSm.svg?react";
import NavListIcon from "@/assets/svgs/NavListIcon.svg?react";
import { Link, useNavigate } from "react-router";
import DefaultButton from "./ui/DefaultButton";
import { useState } from "react";
import UserNav from "./UserNav";
import { useLanguage } from "../localization/useLanguage";
import SearchBar from "./ui/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownItem {
  id: string;
  title: string;
  image: string;
  link: string;
}

const dummyData: Record<string, DropdownItem[]> = {
  courses: [
    {
      id: "1",
      title: "React Basics",
      image: "/dummy/react.png",
      link: "/course/1",
    },
    {
      id: "2",
      title: "Vue Fundamentals",
      image: "/dummy/vue.png",
      link: "/course/2",
    },
  ],
  programs: [
    {
      id: "1",
      title: "Fullstack Program",
      image: "/dummy/fullstack.png",
      link: "/program/1",
    },
    {
      id: "2",
      title: "Frontend Program",
      image: "/dummy/frontend.png",
      link: "/program/2",
    },
  ],
  experts: [
    { id: "1", title: "John Doe", image: "/dummy/john.png", link: "/expert/1" },
    {
      id: "2",
      title: "Jane Smith",
      image: "/dummy/jane.png",
      link: "/expert/2",
    },
  ],
};

const Header = ({
  isLoggedIn = false,
  color,
}: {
  isLoggedIn?: boolean;
  color?: string;
}) => {
  const { t, lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null); // ✅ Desktop Hover State
  const navigate = useNavigate();

  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => dummyData.courses,
  });
  const { data: programsData } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => dummyData.programs,
  });
  const { data: expertsData } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => dummyData.experts,
  });

  return (
    <header
      className={`bg-${
        color ?? "primary"
      } py-2 z-50 sticky top-0 start-0 end-0`}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4">
        <Link to={"/userHome"}>
          <LogoSm className="cursor-pointer" />
        </Link>

        <SearchBar
          placeholder={t("search_placeholder")}
          lang={lang}
          className="sm:max-w-md mx-auto max-md:hidden"
        />

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 relative">
          {["courses", "programs", "experts"].map((key) => (
            <Link
              to={
                key === "courses"
                  ? "/latest-courses"
                  : key === "programs"
                  ? "programs-list"
                  : "experts-list"
              }
              key={key}
              className="relative"
              onMouseEnter={() => setDesktopDropdown(key)}
              onMouseLeave={() => setDesktopDropdown(null)}
            >
              <span className="cursor-pointer">
                {key === "courses"
                  ? t("nav_courses")
                  : key === "programs"
                  ? t("nav_programs")
                  : t("nav_experts")}
              </span>

              {/* Desktop Dropdown */}
              <AnimatePresence>
                {desktopDropdown === key && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 bg-white shadow-lg rounded-xl p-3 min-w-[220px] z-40"
                  >
                    {(key === "courses"
                      ? coursesData
                      : key === "programs"
                      ? programsData
                      : expertsData
                    )?.map((item) => (
                      <Link
                        key={item.id}
                        to={item.link}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                      >
                        <img src={item.image} className="w-8 h-8 rounded" />
                        {item.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {!isLoggedIn && (
          <div className="hidden md:flex gap-4 items-center">
            <DefaultButton
              text={t("auth_login")}
              type="reset"
              moreStyle="px-6 !py-1"
              onClick={() => navigate("/login")}
            />
          </div>
        )}

        <div className="flex gap-4">
          {isLoggedIn && <UserNav />}
          <button
            className="md:hidden flex items-center cursor-pointer p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <NavListIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-primary px-4 mt-2 pt-4 overflow-hidden"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <nav className="flex flex-col gap-2">
              <div>
                <Link
                  to={"/latest-courses"}
                  className="cursor-pointer font-semibold px-5 py-2 block hover:bg-white rounded-xl"
                >
                  {t("nav_courses")}
                </Link>
                <Link
                  to={"programs-list"}
                  className="cursor-pointer font-semibold px-5 py-2 block hover:bg-white rounded-xl"
                >
                  {t("nav_programs")}
                </Link>
                <Link
                  to={"experts-list"}
                  className="cursor-pointer font-semibold px-5 py-2 block hover:bg-white rounded-xl"
                >
                  {t("nav_experts")}
                </Link>
              </div>
            </nav>

            {!isLoggedIn && <Link to="/login">{t("auth_login")}</Link>}

            <div className="flex justify-between mt-4 gap-2">
              {!isLoggedIn && (
                <DefaultButton
                  text={t("auth_register")}
                  type="reset"
                  moreStyle="w-[150px] !py-1"
                  onClick={() => {}}
                />
              )}
            </div>

            <div className="md:hidden mb-2">
              <SearchBar
                placeholder={t("search_placeholder")}
                lang={lang}
                className="max-w-md mx-auto"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
