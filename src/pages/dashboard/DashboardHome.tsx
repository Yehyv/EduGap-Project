import { useLanguage } from "@/shared/localization/useLanguage";
import ProgramsDropdown from "@/features/Dashboard/components/ProgramsDropdown";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ROLES } from "@/shared/utils/globals";
import HomeChartSlider from "@/features/Dashboard/components/HomeChartSlider";
import StatsCards from "@/features/Dashboard/components/StatsCards";
import useDecodedToken from "@/shared/hooks/useDecodedToken";
import usePrograms from "@/shared/hooks/usePrograms";
import QuickActionsPanel from "@/features/Dashboard/components/QuickActionsPanel";
import useDashboardCounts from "@/shared/hooks/useDashboardCounts";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
  },
};

const slideInFromRight = (lang) => ({
  hidden: { opacity: 0, x: lang === "ar" ? -20 : 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardHome = () => {
  const { t, lang } = useLanguage();
  const { dashboardToken } = useAuth();
  const { userRole, instituteId } = useDecodedToken(dashboardToken);

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  const { programs, selectedProgram, setSelectedProgram } = usePrograms(
    isSuperAdmin ? null : instituteId,
  );

  const counts = useDashboardCounts({ userRole, selectedProgram });

  return (
    <motion.div
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={slideDown} initial="hidden" animate="visible">
        <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {t("dashboard")}
        </h4>
        <p className="text-[#808080] mt-1">{t("welcomeMessage")}</p>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-col-reverse xl:flex-row gap-6">
        {/* Left: Stats & Chart */}
        <div className="flex-1 space-y-6">
          {/* Program Filter — only for non-super-admin */}
          {!isSuperAdmin && (
            <ProgramsDropdown
              data={programs}
              value={selectedProgram}
              onChange={setSelectedProgram}
            />
          )}

          {/* Stats Cards */}
          <StatsCards userRole={userRole} counts={counts} />

          {/* Chart */}
          <motion.div
            className="bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            variants={slideUp}
            initial="hidden"
            animate="visible"
          >
            <div className="w-full">
              <HomeChartSlider
                isSuperAdmin={userRole === ROLES.SUPER_ADMIN}
                programId={selectedProgram?.value}
              />
            </div>
          </motion.div>
        </div>

        {/* Right: Quick Actions */}
        <motion.div
          variants={slideInFromRight(lang)}
          initial="hidden"
          animate="visible"
        >
          <QuickActionsPanel
            userRole={userRole}
            instituteId={instituteId}
            lang={lang}
            t={t}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
