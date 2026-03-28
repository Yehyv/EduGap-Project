import TotalTrainingCoursesIcon from "@/assets/svgs/totalTrainingCoursesIcon.svg?react";
import TotalStudentsIcon from "@/assets/svgs/totalStudentsIcon.svg?react";
import AllPartnersIcon from "@/assets/svgs/AllPartnersIcon.svg?react";
import IncreaseArrowIcon from "@/assets/svgs/IncreaseArrowIcon.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";

const StatCard = ({ item, index, lang }) => {
  const { t } = useLanguage();

  return (
    <div
      className="group relative overflow-hidden p-5 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 animate-scaleIn border border-gray-100 hover:border-transparent"
      style={{ animationDelay: `${index * 100}ms` }}
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
        {item.value ?? "0"}
      </h3>

      {/* Growth Indicator */}
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
    </div>
  );
};

const StatsCards = ({ counts }) => {
  const { t, lang } = useLanguage();

  const stats = [
    {
      title: t("totalTrainingCourses"),
      value: counts?.totalTrainingCourses,
      icon: <TotalTrainingCoursesIcon />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: t("totalStudents"),
      value: counts?.totalStudents,
      icon: <TotalStudentsIcon />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: t("totalCourses"),
      value: counts?.totalCourses,
      icon: <AllPartnersIcon />,
      gradient: "from-orange-500 to-red-500",
    },
    //             {
    //     title: t("averageRating"),
    //     value: "5",
    //     icon: <AverageRatingIcon />,
    //     gradient: "from-green-500 to-emerald-500",
    //   },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((item, index) => (
        <StatCard key={index} item={item} index={index} lang={lang} />
      ))}
    </div>
  );
};

export default StatsCards;
