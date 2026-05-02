import {
  getTotalActiveStudents,
  getTotalAiContentGenrated,
  getTotalCoursesCount,
  getTotalInstitutes,
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

  const { data: totalActiveStudents } = useQuery({
    queryKey: ["getTotalActiveStudents", programId],
    queryFn: () => getTotalActiveStudents(programId ?? ""),
    enabled,
  });
  const { data: coursesData } = useQuery({
    queryKey: ["getTotalCoursesCountData", programId],
    queryFn: () => getTotalCoursesCount(programId ?? ""),
    enabled,
  });
  const { data: totalInstitutes } = useQuery({
    queryKey: ["getTotalInstitutions", programId],
    queryFn: () => getTotalInstitutes(programId ?? ""),
    enabled: isSuperAdmin,
  });
  const { data: aiContentCount } = useQuery({
    queryKey: ["getAiContentCount", programId],
    queryFn: () => getTotalAiContentGenrated(programId ?? ""),
    enabled: isSuperAdmin,
  });

  return {
    totalTrainingCourses: trainingCoursesData?.data?.totalContents,
    totalStudents: studentsData?.data?.totalStudents,
    totalCourses: coursesData?.data?.totalCourses,
    totalActiveStudents: totalActiveStudents?.data?.activeStudents,
    totalInstitutes: totalInstitutes?.data?.totalInstitutes,
    aiContent: aiContentCount?.data?.aiContentsCount,
  };
};

export default useDashboardCounts;
