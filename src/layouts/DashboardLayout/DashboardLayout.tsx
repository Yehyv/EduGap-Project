import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

import LogoSm from "@/assets/svgs/EduGapWithShadow.svg?react";
import CloseIcon from "@/assets/svgs/CloseIcon.svg?react";
import DashboardIcon from "@/assets/svgs/DashboardIcon.svg?react";
import GovernmentIcon from "@/assets/svgs/GovernmentIcon.svg?react";
import StudentIcon from "@/assets/svgs/studentSidebarIcon.svg?react";
import CoursesDashboardIcon from "@/assets/svgs/CoursesDashboardIcon.svg?react";
import Arrow from "@/assets/svgs/RightArrow.svg?react";
import ProgramsIcon from "@/assets/svgs/ProgramsIcon.svg?react";
import LearningPathsIcon from "@/assets/svgs/LearningPaths.svg?react";
import EducatorsIcon from "@/assets/svgs/educatorsIcon.svg?react";
import PersonIcon from "@/assets/imgs/ForDev/Person.jpg";

import SearchBar from "@/features/Dashboard/components/SearchBar";

const navLinkClass = ({ isActive }) =>
  `
  p-2 flex items-center gap-2 rounded-xl text-sm transition-all
  ${
    isActive
      ? "text-secondary font-bold bg-[#ECF8FF]"
      : "text-[#ACACAC] hover:text-secondary hover:font-bold hover:bg-[#ECF8FF]"
  }
  dark:hover:bg-gray-700
`;

const InstitutesPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen gap-2 bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 start-0 h-screen w-64 bg-white z-40 dark:bg-gray-800
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:fixed
        `}
      >
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

        <h5 className="text-[#ACACAC] px-4 mx-2 mt-4">Menu</h5>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-1 overflow-y-auto">
          <NavLink to="/dashboard" end className={navLinkClass}>
            <DashboardIcon />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/institutes" className={navLinkClass}>
            <GovernmentIcon />
            <span>Institutes</span>
          </NavLink>

          <NavLink to="/students" className={navLinkClass}>
            <StudentIcon />
            <span>Students</span>
          </NavLink>

          <NavLink to="/programs" className={navLinkClass}>
            <ProgramsIcon />
            <span>Programs</span>
          </NavLink>

          <NavLink to="/dashboard-courses" className={navLinkClass}>
            <CoursesDashboardIcon />
            <span>Courses</span>
          </NavLink>

          <NavLink to="/dashboard/learning-paths" className={navLinkClass}>
            <LearningPathsIcon />
            <span>Learning Paths</span>
          </NavLink>

          <NavLink to="/dashboard/experts" className={navLinkClass}>
            <EducatorsIcon />
            <span>Experts</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:me-4 md:ms-64 pt-2">
        {/* Header */}
        <header className="py-2 bg-white dark:bg-gray-900 rounded-2xl flex items-center mx-6 justify-between px-4">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
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

          <SearchBar placeholder="Search" />

          {/* Profile */}
          <div className="bg-[#F5F5F5] px-2 py-1 rounded-lg flex items-center gap-3 text-sm cursor-pointer shadow-sm hover:shadow-md transition-shadow">
            <img
              src={PersonIcon}
              alt="Person"
              className="h-10 rounded-lg object-cover"
              loading="lazy"
            />
            <div className="flex-1 overflow-hidden max-sm:hidden">
              <h5 className="font-medium truncate">Abdullah Shaaban</h5>
              <span className="text-[#ACACAC] truncate block">Admin</span>
            </div>
            <Arrow className="w-5 rotate-90 ms-4 max-sm:hidden" />
          </div>
        </header>

        {/* Outlet */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstitutesPage;
