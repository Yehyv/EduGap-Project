import {
  getTotalCoursesCount,
  getTotalStudentsCountData,
  getTotalTrainingCoursesCount,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import { ROLES } from "../utils/globals";

const useDashboardCounts = ({ userRole, selectedProgram }) => {
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  // For non-super-admin: only fetch when a program is selected
  // For super-admin: always fetch (no program filter needed)
  const programId = isSuperAdmin ? "" : selectedProgram?.value;
  const enabled = isSuperAdmin || selectedProgram !== null;

  const { data: trainingCoursesData } = useQuery({
    queryKey: ["getTotalTrainingCoursesCountData", programId],
    queryFn: () => getTotalTrainingCoursesCount(programId ?? ""),
    enabled,
  });

  const { data: studentsData } = useQuery({
    queryKey: ["getStudentsCountData", programId],
    queryFn: () => getTotalStudentsCountData(programId ?? ""),
    enabled,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["getTotalCoursesCountData", programId],
    queryFn: () => getTotalCoursesCount(programId ?? ""),
    enabled,
  });

  return {
    totalTrainingCourses: trainingCoursesData?.data?.totalContents,
    totalStudents: studentsData?.data?.totalStudents,
    totalCourses: coursesData?.data?.totalCourses,
  };
};

export default useDashboardCounts;
