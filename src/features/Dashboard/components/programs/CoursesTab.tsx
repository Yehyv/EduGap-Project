import { useQueryClient } from "@tanstack/react-query";
import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { deleteCourseFromProgram } from "@/features/Dashboard/services/dashboardApis";
import type { CourseInProgram } from "./types";
import { useLanguage } from "@/shared/localization/useLanguage";

interface CoursesTabProps {
  coursesInProgram: CourseInProgram[];
  programId?: string;
  onAddCourse: () => void;
}

const CoursesTab = ({
  coursesInProgram,
  programId,
  onAddCourse,
}: CoursesTabProps) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const handleDeleteCourse = (courseId: string) => {
    return deleteCourseFromProgram(courseId, programId ?? "").then(() =>
      queryClient.invalidateQueries({
        queryKey: ["getAllCoursesToAssign"],
      }),
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h5 className="text-lg font-semibold text-secondary">
          {t("coursesLinkedToProgram")}
        </h5>
        <button
          onClick={onAddCourse}
          className="bg-gradient-to-r from-[#FCB737] to-[#BB831A] flex items-center gap-2 py-2 px-4 rounded-xl shadow-md hover:to-[#FCB737] transition text-white text-sm font-medium"
        >
          <PlusIcon className="h-5" />
          <span>{t("addCourseToProgram")}</span>
        </button>
      </div>

      {coursesInProgram.length > 0 ? (
        <div className="space-y-3">
          {coursesInProgram.map((course, index) => (
            <div
              key={course.id}
              className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-semibold text-sm">
                    {index + 1}
                  </span>
                </div>
                <span className="text-gray-800 font-medium">{course.name}</span>
              </div>

              <DeleteButton
                deleteApi={() => handleDeleteCourse(course.id)}
                successMessage={t("courseRemovedSuccessfully")}
                errorMessage={t("errorWhileDeletingCourse")}
                refetchFunction="coursesInProgram"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">{t("noCoursesAvailable")}</p>
          <button
            onClick={onAddCourse}
            className="text-secondary hover:underline text-sm"
          >
            {t("addYourFirstCourse")}
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesTab;
