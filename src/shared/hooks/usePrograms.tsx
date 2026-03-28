import { getAllProgramsForDropdown } from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const usePrograms = (instituteId) => {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const { data } = useQuery({
    queryKey: ["getAllPrograms", instituteId],
    queryFn: () => getAllProgramsForDropdown(instituteId),
    enabled: instituteId ? true : false,
  });

  const programs =
    data?.data.map((p) => ({ label: p.name, value: p.id })) ?? [];

  // Auto-select the first program when programs load
  useEffect(() => {
    if (programs.length > 0 && selectedProgram === null) {
      setSelectedProgram(programs[0]);
    }
  }, [programs]);

  return { programs, selectedProgram, setSelectedProgram };
};
export default usePrograms;
