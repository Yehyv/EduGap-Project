import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import {
  courseDetailsForDashboard,
  getProgramsForCourse,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import ContentsInCourse from "@/features/Dashboard/components/ContentsInCourse";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { FolderOpen } from "lucide-react";

type TabType = "data" | "sessions" | "programs";

interface Translation {
  name: string;
  description: string;
  whatToLearn: string;
}

interface CourseData {
  id: string;
  image: string;
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
  translations: Translation[];
}

interface ProgramInCourse {
  id: string;
  name: string;
}

const CourseDetailsDashboard = () => {
  const { courseId } = useParams();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("data");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["courseDetailsForDashboard", courseId],
    queryFn: () => courseDetailsForDashboard(courseId ?? ""),
    enabled: !!courseId,
  });

  const courseData: CourseData | undefined = data?.data;
  const courseDataEn = courseData?.translations?.[0];
  const courseDataAr = courseData?.translations?.[1];

  if (isLoading) return <CircleLoader />;

  if (isError) {
    return <ErrorMessage message={error?.message ?? "Error fetching course"} />;
  }

  if (!courseData) {
    return <ErrorMessage message="Course not found" />;
  }

  const tabClass = (tab: TabType) =>
    `rounded-lg border flex-1 py-2.5 px-4 cursor-pointer transition-all font-medium ${
      activeTab === tab
        ? "border-secondary text-secondary bg-secondary/5 shadow-sm"
        : "border-gray-300 text-gray-600 hover:border-secondary/50 hover:text-secondary/70"
    }`;

  return (
    <div className="space-y-5">
      <DashboardPageTitle
        text={`${t("courseTitle")} ${courseDataEn?.name || ""}`}
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link
            to={`/dashboard/courses/edit/${courseData.id}`}
            className="flex items-center gap-2"
          >
            <EditIcon className="h-8" />
            <span className="text-secondary">{t("editCourse")}</span>
          </Link>
        }
      />

      <div className="flex gap-4">
        <button
          className={tabClass("data")}
          onClick={() => setActiveTab("data")}
        >
          {t("tabCourseData")}
        </button>

        <button
          className={tabClass("sessions")}
          onClick={() => setActiveTab("sessions")}
        >
          {t("tabCourseSessions")}
        </button>

        <button
          className={tabClass("programs")}
          onClick={() => setActiveTab("programs")}
        >
          Programs
        </button>
      </div>

      {activeTab === "data" && (
        <DataTab
          courseData={courseData}
          courseDataEn={courseDataEn}
          courseDataAr={courseDataAr}
          t={t}
        />
      )}

      {activeTab === "sessions" && <ContentsInCourse />}

      {activeTab === "programs" && <ProgramsTab courseId={courseId} />}
    </div>
  );
};

/* ================= DATA TAB COMPONENT ================= */
interface DataTabProps {
  courseData: CourseData;
  courseDataEn?: Translation;
  courseDataAr?: Translation;
  t: (key: string) => string;
}

const DataTab = ({
  courseData,
  courseDataEn,
  courseDataAr,
  t,
}: DataTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h5 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-3 mb-4">
          {t("courseDataTitle")}
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataField label={t("fieldName")} value={courseDataEn?.name} />

          <div className="md:row-span-2 self-start">
            <h6 className="text-sm font-bold text-gray-700 mb-3">
              {t("fieldImage")}
            </h6>
            {courseData.image && (
              <img
                className="max-h-64 rounded-xl shadow-md object-cover"
                src={courseData.image}
                alt={t("fieldImage")}
              />
            )}
          </div>

          <DataField
            label={t("fieldDescription")}
            value={courseDataEn?.description}
          />

          <div className="col-span-2">
            <h6 className="text-sm font-bold text-gray-700 mb-2">
              {t("fieldWhatToLearn")}
            </h6>
            <ul className="list-disc ps-5 space-y-1">
              {courseDataEn?.whatToLearn?.split(",").map((item, index) => (
                <li key={index} className="text-gray-600">
                  {item.trim()}
                </li>
              ))}
            </ul>
          </div>

          <DataField
            label={t("fieldCreatedAt")}
            value={courseData?.createdAt ?? ""}
          />
          <DataField
            label={t("fieldCreatedBy")}
            value={courseData?.createdBy?.name ?? ""}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h5 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-3 mb-4">
          {t("courseDataTitle")} (Arabic)
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataField label={t("fieldName")} value={courseDataAr?.name} />
          <DataField
            label={t("fieldDescription")}
            value={courseDataAr?.description}
          />

          <div className="col-span-2">
            <h6 className="text-sm font-bold text-gray-700 mb-2">
              {t("fieldWhatToLearn")}
            </h6>
            <ul className="list-disc ps-5 space-y-1">
              {courseDataAr?.whatToLearn?.split(",").map((item, index) => (
                <li key={index} className="text-gray-600">
                  {item.trim()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= PROGRAMS TAB COMPONENT ================= */
interface ProgramsTabProps {
  courseId?: string;
}

const ProgramsTab = ({ courseId }: ProgramsTabProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["programsForCourse", courseId],
    queryFn: () => getProgramsForCourse(courseId ?? ""),
    enabled: !!courseId,
  });

  const programs: ProgramInCourse[] = data?.data?.data ?? [];

  if (isLoading) return <CircleLoader />;

  if (isError) return <ErrorMessage message="Error loading programs" />;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex gap-2 items-center mb-6">
        <FolderOpen className="w-6 h-6 text-secondary" />
        <h5 className="text-lg font-semibold text-secondary">
          Programs Using This Course
        </h5>
      </div>

      {programs.length > 0 ? (
        <>
          <p className="text-gray-600 mb-6">
            This course is included in the following programs:
          </p>

          <div className="space-y-3">
            {programs.map((program, index) => (
              <Link
                key={program.id}
                to={`/dashboard/programs/${program.id}`}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <span className="text-secondary font-semibold">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1">
                  <h6 className="text-gray-800 font-medium group-hover:text-secondary transition-colors">
                    {program.name}
                  </h6>
                </div>

                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-secondary transition-colors mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            This course is not part of any program yet
          </p>
          <p className="text-sm text-gray-500">
            Add this course to a program to get started
          </p>
        </div>
      )}
    </div>
  );
};

/* ================= REUSABLE DATA FIELD COMPONENT ================= */
interface DataFieldProps {
  label: string;
  value?: string;
}

const DataField = ({ label, value }: DataFieldProps) => {
  return (
    <div>
      <h6 className="text-sm font-bold text-gray-700 mb-1">{label}</h6>
      <p className="text-gray-600">{value || "-"}</p>
    </div>
  );
};

export default CourseDetailsDashboard;
