import TotalTrainingCoursesIcon from "@/assets/svgs/totalTrainingCoursesIcon.svg?react";
import TotalStudentsIcon from "@/assets/svgs/totalStudentsIcon.svg?react";
import AllPartnersIcon from "@/assets/svgs/AllPartnersIcon.svg?react";
import AverageRatingIcon from "@/assets/svgs/AverageRatingIcon.svg?react";
import IncreaseArrowIcon from "@/assets/svgs/IncreaseArrowIcon.svg?react";
import PlusSign from "@/assets/svgs/PlusSign.svg?react";
import TrendIconDashboard from "@/assets/svgs/TrendIconDashboard.svg?react";
import { Link } from "react-router-dom";
import HomeChart from "@/features/Dashboard/components/HomeChart";
import { useLanguage } from "@/shared/localization/useLanguage";

const DashboardHome = () => {
  const { t, lang } = useLanguage();

  const stats = [
    {
      title: t("totalTrainingCourses"),
      value: "1,245",
      icon: <TotalTrainingCoursesIcon />,
      arrow: "up",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: t("totalStudents"),
      value: "86",
      icon: <TotalStudentsIcon />,
      arrow: "up",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: t("partnerInstitutions"),
      value: "742",
      icon: <AllPartnersIcon />,
      arrow: "up",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: t("averageRating"),
      value: "5",
      icon: <AverageRatingIcon />,
      arrow: "up",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="animate-slideDown">
        <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {t("dashboard")}
        </h4>
        <p className="text-[#808080] mt-1">{t("welcomeMessage")}</p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col-reverse xl:flex-row gap-6">
        {/* Left: Stats & Chart */}
        <div className="flex-1 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-5 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 animate-scaleIn border border-gray-100 hover:border-transparent"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Icon Badge */}
                <div className="relative flex justify-between items-start mb-3">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <div className="w-6 h-6 text-white">{item.icon}</div>
                  </div>
                </div>

                {/* Title */}
                <p className="text-sm text-gray-500 mb-2 group-hover:text-gray-700 transition-colors duration-300">
                  {item.title}
                </p>

                {/* Value */}
                <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-300">
                  {item.value}
                </h3>

                {/* Growth Indicator */}
                {item.arrow === "up" && (
                  <div
                    className={`flex items-center gap-2 ${lang === "ar" ? "flex-row-reverse" : ""}`}
                  >
                    <IncreaseArrowIcon
                      className={`transform group-hover:translate-y-[-4px] transition-transform duration-300 ${lang === "ar" ? "rotate-180" : ""}`}
                    />
                    <p className="text-green-500 text-sm font-medium">
                      {t("increaseThisMonth")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 animate-slideUp">
            <div className="mb-6 p-6 pb-0">
              <h5 className="text-xl font-bold text-gray-900 mb-1">
                {t("studentEngagement")}
              </h5>
              <p className="text-[#808080] text-sm">
                {t("subscriptionsAndEngagement")}
              </p>
            </div>

            {/* Responsive Chart Container */}
            <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
              <HomeChart />
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="xl:w-72 flex-shrink-0 animate-slideLeft">
          <div className="xl:sticky xl:top-6 p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-100 space-y-4 hover:shadow-lg transition-shadow duration-300">
            <h6 className="text-gray-600 font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-secondary to-blue-600 rounded-full" />
              {t("quickActions")}
            </h6>

            <Link
              className="group relative overflow-hidden bg-secondary hover:bg-blue-600 text-white text-sm font-bold rounded-2xl px-5 py-3.5 flex items-center justify-between w-full shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              to={"/dashboard/contents/add"}
            >
              <span className="relative z-10">{t("addNewTrainingCourse")}</span>
              <PlusSign
                className={`w-5 h-5 relative z-10 transform group-hover:rotate-90 transition-transform duration-300 ${lang === "ar" ? "me-2" : "ms-2"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>

            <Link
              className="group relative overflow-hidden bg-[#FCB737] hover:bg-[#F5A623] text-white text-sm font-bold rounded-2xl px-5 py-3.5 flex items-center justify-between w-full shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              to={"/dashboard/learning-paths/add"}
            >
              <span className="relative z-10">{t("addNewLearningPath")}</span>
              <TrendIconDashboard
                className={`w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-300 ${lang === "ar" ? "me-2" : "ms-2"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(${lang === "ar" ? "-" : ""}20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out 0.2s both;
        }

        .animate-slideLeft {
          animation: slideLeft 0.6s ease-out 0.3s both;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
