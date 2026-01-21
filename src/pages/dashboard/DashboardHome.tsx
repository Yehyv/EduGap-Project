import TotalTrainingCoursesIcon from "@/assets/svgs/totalTrainingCoursesIcon.svg?react";
import TotalStudentsIcon from "@/assets/svgs/totalStudentsIcon.svg?react";
import AllPartnersIcon from "@/assets/svgs/AllPartnersIcon.svg?react";
import AverageRatingIcon from "@/assets/svgs/AverageRatingIcon.svg?react";
import IncreaseArrowIcon from "@/assets/svgs/IncreaseArrowIcon.svg?react";
import PlusSign from "@/assets/svgs/PlusSign.svg?react";
import TrendIconDashboard from "@/assets/svgs/TrendIconDashboard.svg?react";
import { Link } from "react-router-dom";
import HomeChart from "@/features/Dashboard/components/HomeChart";

const DashboardHome = () => {
  const stats = [
    {
      title: "Total Training Courses",
      value: "1,245",
      icon: <TotalTrainingCoursesIcon />,
      arrow: "up",
    },
    {
      title: "Total Students",
      value: "86",
      icon: <TotalStudentsIcon />,
      arrow: "up",
    },
    {
      title: "Partner Institutions",
      value: "742",
      icon: <AllPartnersIcon />,
      arrow: "up",
    },
    {
      title: "Average Rating",
      value: "5",
      icon: <AverageRatingIcon />,
      arrow: "up",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h4 className="text-xl font-semibold">Dashboard</h4>
        <p className="text-[#808080]">
          Welcome back! Here is an overview of your platform’s activity.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col-reverse xl:flex-row gap-6">
        {/* Left: Stats & Chart */}
        <div className="flex-1 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-between p-4 rounded-xl bg-white shadow-sm"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>{item.title}</span>
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold">{item.value}</h3>
                {item.arrow === "up" && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-green-500">+25% هذا الشهر</p>
                    <IncreaseArrowIcon />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white p-7 shadow-sm rounded-xl">
            <h5 className="font-bold">Student Engagement</h5>
            <p className="text-[#808080] mb-4">
              Subscriptions & Active Engagement Rate
            </p>
            <HomeChart />
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="xl:w-64 flex-shrink-0">
          <div className="xl:sticky top-20 flex flex-col p-4 rounded-xl bg-white shadow-sm space-y-3">
            <h6 className="text-[#808080] text-start">Quick Actions</h6>

            <Link
              className="bg-secondary text-white text-sm font-bold rounded-2xl px-4 py-1.5 flex items-center justify-between max-xl:w-fit"
              to={""}
            >
              <span>Add New Training Course</span>
              <PlusSign className="w-5 h-5 ms-2" />
            </Link>

            <Link
              className="bg-[#FCB737] text-white text-sm font-bold rounded-2xl px-4 py-1.5 flex items-center justify-between max-xl:w-fit"
              to={""}
            >
              <span>Add New Learning Path</span>
              <TrendIconDashboard className="w-5 h-5 ms-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
