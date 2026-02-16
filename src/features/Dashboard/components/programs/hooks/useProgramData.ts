import { useQuery } from "@tanstack/react-query";
import {
  getCoursesInProgramV2,
  programDetailsForAdmin,
  getProgramInstitutes,
} from "@/features/Dashboard/services/dashboardApis";

export const useProgramData = (programId: string | undefined) => {
  const programQuery = useQuery({
    queryKey: ["programDetails", programId],
    queryFn: () => programDetailsForAdmin(programId ?? ""),
    enabled: !!programId,
  });

  const coursesQuery = useQuery({
    queryKey: ["coursesInProgram", programId],
    queryFn: () => getCoursesInProgramV2(programId ?? ""),
    enabled: !!programId,
  });

  const institutesQuery = useQuery({
    queryKey: ["programInstitutes", programId],
    queryFn: () => getProgramInstitutes(programId ?? ""),
    enabled: !!programId,
  });

  const programData = programQuery.data?.data;
  const programDataAr = programData?.translations?.[0];
  const programDataEn = programData?.translations?.[1];
  const coursesInProgram = coursesQuery.data?.data?.data || [];
  const institutes = institutesQuery.data?.data || [];

  return {
    programData,
    programDataAr,
    programDataEn,
    coursesInProgram,
    institutes,
    isLoading: programQuery.isLoading,
    error: programQuery.error,
    institutesLoading: institutesQuery.isLoading,
  };
};
