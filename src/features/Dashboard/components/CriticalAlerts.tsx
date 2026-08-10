import { useQuery } from "@tanstack/react-query";
import {
  fetchStudentsWithoutCourse,
  fetchInstitutesExpiringWithinMonth,
  fetchInstitutesWithHighNoCourseStudents,
} from "../services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Alert {
  id: number;
  title: string;
  description: string;
  tag: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const WarningIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1.5L14.5 13H1.5L8 1.5Z"
      fill="#BA7517"
      stroke="#BA7517"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
    <rect x="7.25" y="6" width="1.5" height="3.5" rx="0.75" fill="#fff" />
    <rect x="7.25" y="10.75" width="1.5" height="1.5" rx="0.75" fill="#fff" />
  </svg>
);

// ─── Alert Row ────────────────────────────────────────────────────────────────

const AlertRow = ({ description }: { description: string }) => (
  <div className="flex gap-3 px-4 py-2 items-center bg-yellow-50 rounded-2xl border border-yellow-200">
    <WarningIcon size={16} />
    <p className="text text-gray-500 leading-relaxed">{description}</p>
  </div>
);

const AlertRowSkeleton = () => (
  <div className="flex gap-3 px-4 py-2 items-center bg-yellow-50 rounded-2xl border border-yellow-200 animate-pulse">
    <div className="w-4 h-4 rounded bg-amber-200 flex-shrink-0" />
    <div className="h-3.5 rounded bg-amber-100 w-3/4" />
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const CriticalAlerts = () => {
  const { t } = useLanguage();
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students-without-course"],
    queryFn: fetchStudentsWithoutCourse,
  });

  const { data: institutesData, isLoading: institutesLoading } = useQuery({
    queryKey: ["institutes-expiring-within-month"],
    queryFn: fetchInstitutesExpiringWithinMonth,
  });

  const { data: highNoCourseData, isLoading: highNoCourseLoading } = useQuery({
    queryKey: ["institutes-with-high-no-course-students"],
    queryFn: fetchInstitutesWithHighNoCourseStudents,
  });
  const institutesAlert: Alert | null = institutesData?.data
    ? {
        id: 1,
        title: t("institutionsExpiringSoon"),
        description: `${institutesData.data.institutesExpiringWithinMonth} ${
          institutesData.data.institutesExpiringWithinMonth !== 1
            ? t("institutionsHaveSubscriptionsExpiring")
            : t("institutionHasSubscriptionExpiring")
        }`,
        tag: t("expiresIn30Days"),
      }
    : null;

  const studentsAlert: Alert | null = studentsData?.data
    ? {
        id: 2,
        title: t("studentsAtRisk"),
        description: `${studentsData.data.studentsWithoutCourseAfterThreeMonths} ${t(
          "studentsOf",
        )} ${studentsData.data.totalStudents} (${studentsData.data.percentage.toFixed(
          1,
        )}%) ${t("haventEnrolledInCourse")}`,
        tag: t("lowActivity"),
      }
    : null;

  const highNoCourseAlert: Alert | null =
    (highNoCourseData?.data?.institutesCount ?? 0) > 0
      ? {
          id: 3,
          title: t("institutionsWithHighInactiveStudents"),
          description: `${highNoCourseData!.data.institutesCount} ${
            highNoCourseData!.data.institutesCount !== 1
              ? t("institutionsHaveMoreThan")
              : t("institutionHasMoreThan")
          } ${highNoCourseData!.data.thresholdPercentage}% ${t(
            "studentsWithoutCourseAfter3Months",
          )}`,
          tag: t("highInactivity"),
        }
      : null;

  const allAlerts: Alert[] = [
    ...(institutesAlert ? [institutesAlert] : []),
    ...(studentsAlert ? [studentsAlert] : []),
    ...(highNoCourseAlert ? [highNoCourseAlert] : []),
  ];

  const isLoading = institutesLoading || studentsLoading || highNoCourseLoading;

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-custom overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
        <div>
          <span className="text-xl font-semibold text-gray-900">
            {t("criticalAlerts")}
          </span>
          <p className="text-gray-400">
            {t("itemsRequiringImmediateAttention")}
          </p>
        </div>
        <span className="ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
          {isLoading ? "..." : allAlerts.length} {t("alerts")}
        </span>
      </div>

      {/* Alert list */}
      <div className="flex gap-2 p-3 flex-col divide-y divide-gray-100">
        {institutesLoading ? (
          <AlertRowSkeleton />
        ) : (
          institutesAlert && (
            <AlertRow description={institutesAlert.description} />
          )
        )}

        {studentsLoading ? (
          <AlertRowSkeleton />
        ) : (
          studentsAlert && <AlertRow description={studentsAlert.description} />
        )}

        {highNoCourseLoading ? (
          <AlertRowSkeleton />
        ) : (
          highNoCourseAlert && (
            <AlertRow description={highNoCourseAlert.description} />
          )
        )}
      </div>
    </div>
  );
};

export default CriticalAlerts;
