import QuickActionLink from "./QuickActionLink";
import PlusSign from "@/assets/svgs/PlusSign.svg?react";
import TrendIconDashboard from "@/assets/svgs/TrendIconDashboard.svg?react";
import { ROLES } from "@/shared/utils/globals";
const QuickActionsPanel = ({ userRole, instituteId, lang, t }) => (
  <div className="xl:w-72 flex-shrink-0 animate-slideLeft">
    <div className="xl:sticky xl:top-6 p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-100 space-y-4 hover:shadow-lg transition-shadow duration-300">
      <h6 className="text-gray-600 font-semibold mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-gradient-to-b from-secondary to-blue-600 rounded-full" />
        {t("quickActions")}
      </h6>

      {userRole === ROLES.SUPER_ADMIN && (
        <>
          <QuickActionLink
            to="/dashboard/contents/add"
            label={t("addNewTrainingCourse")}
            icon={PlusSign}
            color="bg-secondary hover:bg-blue-600"
            lang={lang}
          />
          <QuickActionLink
            to="/dashboard/learning-paths/add"
            label={t("addNewLearningPath")}
            icon={TrendIconDashboard}
            color="bg-[#FCB737] hover:bg-[#F5A623]"
            lang={lang}
          />
        </>
      )}

      {userRole === ROLES.INST_ADMIN && (
        <QuickActionLink
          to={`/dashboard/institutes/${instituteId}?tab=students&openAddStudent=true`}
          label={t("addNewStudent")}
          icon={PlusSign}
          color="bg-secondary hover:bg-blue-600"
          lang={lang}
        />
      )}
    </div>
  </div>
);
export default QuickActionsPanel;
