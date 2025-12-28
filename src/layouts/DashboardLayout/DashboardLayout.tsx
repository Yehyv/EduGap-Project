import { Link, Outlet } from "react-router-dom";
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
import PersonIcon from "@/assets/imgs/ForDev/Person.jpg";
import SearchBar from "@/features/Dashboard/components/SearchBar";
const InstitutesPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen gap-2 bg-gray-50 dark:bg-gray-900">
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

        <div className="h-16 flex items-center justify-center">
          <Link to="/userHome">
            <LogoSm className="cursor-pointer" />
          </Link>
        </div>

        <h5 className="text-[#ACACAC] px-4 mx-2 mt-4">Menu</h5>
        {/* Sidebar Links */}
        <nav className="p-4 flex flex-col gap-1 overflow-y-auto">
          <Link
            className="p-2 flex items-center gap-2 text-[#ACACAC] hover:text-secondary hover:font-bold rounded-xl text-sm hover:bg-[#ECF8FF] dark:hover:bg-gray-700"
            to="#"
          >
            <DashboardIcon />
            <span>Dashboard</span>
          </Link>
          <Link
            className="p-2 flex items-center gap-2 text-[#ACACAC] hover:text-secondary hover:font-bold rounded-xl text-sm hover:bg-[#ECF8FF] dark:hover:bg-gray-700"
            to="/institutes"
          >
            <GovernmentIcon />
            <span>Institutes</span>
          </Link>
          <Link
            className="p-2 flex items-center gap-2 text-[#ACACAC] hover:text-secondary hover:font-bold rounded-xl text-sm hover:bg-[#ECF8FF] dark:hover:bg-gray-700"
            to="/students"
          >
            <StudentIcon />
            <span>Students</span>
          </Link>
          <Link
            className="p-2 flex items-center gap-2 text-[#ACACAC] hover:text-secondary hover:font-bold rounded-xl text-sm hover:bg-[#ECF8FF] dark:hover:bg-gray-700"
            to="/programs"
          >
            <ProgramsIcon />
            <span>Programs</span>
          </Link>
          <Link
            className="p-2 flex items-center gap-2 text-[#ACACAC] hover:text-secondary hover:font-bold rounded-xl text-sm hover:bg-[#ECF8FF] dark:hover:bg-gray-700"
            to="/dashboard-courses"
          >
            <CoursesDashboardIcon />
            <span>Courses</span>
          </Link>
          <Link
            className="p-2 flex items-center gap-2 text-[#ACACAC] hover:text-secondary hover:font-bold rounded-xl text-sm hover:bg-[#ECF8FF] dark:hover:bg-gray-700"
            to="/dashboard/learning-paths"
          >
            <LearningPathsIcon />
            <span>Learning Paths</span>
          </Link>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:me-4 md:ms-64 pt-2">
        {/* Header */}
        <header className="py-2 max-md:gap-2 bg-white  dark:bg-gray-900 rounded-2xl flex items-center mx-6 justify-between px-4">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800"
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

          <div className="bg-[#F5F5F5] px-2 max-sm:px-0 py-1 rounded-lg flex items-center gap-3 text-xs sm:text-sm relative cursor-pointer shadow-sm hover:shadow-md transition-shadow">
            <img
              src={PersonIcon}
              alt="Person"
              className="h-10 rounded-lg object-cover"
              loading="lazy"
            />
            <div className="flex-1 overflow-hidden max-sm:hidden ">
              <h5 className="font-medium truncate">Abdullah Shaaban</h5>
              <span className="text-[#ACACAC] truncate block">Admin</span>
            </div>
            <Arrow className="w-4 sm:w-5 rotate-90 ms-2 sm:ms-4 flex-shrink-0 max-sm:hidden" />
          </div>
        </header>

        {/* Outlet Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstitutesPage;
