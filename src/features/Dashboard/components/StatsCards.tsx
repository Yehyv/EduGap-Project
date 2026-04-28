import TotalTrainingCoursesIcon from "@/assets/svgs/totalTrainingCoursesIcon.svg?react";
import TotalStudentsIcon from "@/assets/svgs/totalStudentsIcon.svg?react";
import AllPartnersIcon from "@/assets/svgs/AllPartnersIcon.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import {
  Book,
  DollarSign,
  UserCheck,
  Users2,
  GraduationCap,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ROLES } from "@/shared/utils/globals";

const StatCard = ({ item, index }) => (
  <div
    className="group relative overflow-hidden p-5 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 animate-scaleIn border border-gray-100 hover:border-transparent"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
    />
    <div className="relative flex justify-between items-start mb-3">
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
      >
        <div className="w-6 h-6 text-white">{item.icon}</div>
      </div>
    </div>
    <p className="text-sm text-gray-500 mb-2 group-hover:text-gray-700 transition-colors duration-300">
      {item.title}
    </p>
    <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-300">
      {item.value ?? "0"}
    </h3>
  </div>
);

const StatsCards = ({ counts }) => {
  const { t } = useLanguage();
  const { role } = useAuth();

  const superAdminStats = [
    {
      title: "Total Institutions",
      value: 29,
      icon: <AllPartnersIcon />,
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      title: "Active Students",
      value: "5,229",
      icon: <Users2 />,
      gradient: "from-sky-500 to-cyan-500",
    },
    {
      title: "Monthly Revenue",
      value: "EGP 310k",
      icon: <DollarSign />,
      gradient: "from-emerald-500 to-green-600",
    },
    {
      title: "Retention Rate",
      value: "91%",
      icon: <UserCheck />,
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      title: t("totalTrainingCourses"),
      value: counts?.totalTrainingCourses,
      icon: <TotalTrainingCoursesIcon />,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: t("totalStudents"),
      value: counts?.totalStudents,
      icon: <TotalStudentsIcon />,
      gradient: "from-fuchsia-500 to-pink-500",
    },
    {
      title: t("totalCourses"),
      value: counts?.totalCourses,
      icon: <Book />,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const otherRoleStats = [
    {
      title: "Total Students",
      value: "1,284",
      icon: <TotalStudentsIcon />,
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      title: "Active Students",
      value: "976",
      icon: <Users2 />,
      gradient: "from-sky-500 to-cyan-500",
    },
    {
      title: "Completion Rate",
      value: "78%",
      icon: <GraduationCap />,
      gradient: "from-emerald-500 to-green-600",
    },
    {
      title: "Skill Improvement",
      value: "64%",
      icon: <TrendingUp />,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Faculty Engagement",
      value: "88%",
      icon: <BookOpen />,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const stats = role === ROLES.SUPER_ADMIN ? superAdminStats : otherRoleStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((item, index) => (
        <StatCard key={index} item={item} index={index} />
      ))}
    </div>
  );
};

export default StatsCards;
