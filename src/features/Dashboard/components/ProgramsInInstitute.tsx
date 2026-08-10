import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import PlusIconGray from "@/assets/svgs/PlusIconGray.svg?react";
import CloseIcon from "@/assets/svgs/CloseRedIcon.svg?react";

import AddCourseToInstituteProgram from "./AddCourseToInstituteProgram";
import AddProgramToInstitute from "./AddProgramToInstitute";

import {
  getProgramsAndCoursesInInstitute,
  unAssignCourseToProgramToInstitute,
  unAssignProgramToInstitute,
} from "../services/dashboardApis";

import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useAuth } from "@/features/auth/context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { ROLES } from "@/shared/utils/globals";
import { useLanguage } from "@/shared/localization/useLanguage";

/* ===== Icons ===== */
const ArrowDown = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUp = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path
      d="M18 15l-6-6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProgramsInInstitute = () => {
  /* ===== State ===== */
  const { t } = useLanguage();
  const [openId, setOpenId] = useState<number | null>(null);
  const { dashboardToken } = useAuth();
  const userRole = jwtDecode(dashboardToken)?.role;

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [activeProgramId, setActiveProgramId] = useState<number | null>(null);

  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  const { instituteId } = useParams();
  const queryClient = useQueryClient();

  /* ===== Toggle Accordion ===== */
  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  /* ===== Query ===== */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["programsAndCoursesInInstit", instituteId],
    queryFn: () => getProgramsAndCoursesInInstitute(instituteId),
  });

  /* ===== Mutations ===== */
  const { mutate: removeProgram } = useMutation({
    mutationFn: ({ programId }: { programId: number }) =>
      unAssignProgramToInstitute(programId, +instituteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programsAndCoursesInInstit"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getAllProgramsToAssign"],
      });
    },
  });

  const { mutate: removeCourse } = useMutation({
    mutationFn: ({
      courseId,
      programId,
    }: {
      courseId: number;
      programId: number;
    }) => unAssignCourseToProgramToInstitute(courseId, programId, instituteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programsAndCoursesInInstit"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getAllProgramsToAssign"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getAllCoursesToAssign"],
      });
    },
  });

  /* ===== Handlers ===== */
  const handleRemoveProgram = async (programId: number) => {
    const result = await Swal.fire({
      title: t("areYouSure"),
      text: t("programWillBeUnassignedFromInstitute"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      removeProgram({ programId });
    }
  };

  const handleRemoveCourse = async (courseId: number, programId: number) => {
    const result = await Swal.fire({
      title: t("areYouSure"),
      text: t("courseWillBeRemovedFromProgram"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      removeCourse({ courseId, programId });
    }
  };

  if (isLoading) return <CircleLoader />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="bg-white p-5 rounded-lg">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center border-b pb-3">
        <h4 className="text-secondary font-bold">{t("programs")}</h4>

        {userRole === ROLES.SUPER_ADMIN && (
          <button
            onClick={() => setIsProgramModalOpen(true)}
            className="bg-gradient-to-r from-[#FCB737] to-[#BB831A] py-0.5 px-3 rounded-xl text-white text-sm flex items-center gap-2"
          >
            <PlusIcon />
            {t("addProgramToInstitute")}
          </button>
        )}
      </div>

      {/* ===== List ===== */}
      <div className="mt-4 space-y-3">
        {data?.data?.length === 0 && (
          <p className="text-center text-gray-400">{t("noDataAvailable")}</p>
        )}

        {data?.data?.map((program: any) => {
          const isOpen = openId === program.id;

          if (!program.id) return <></>;
          return (
            <div key={program.id} className=" rounded-lg overflow-hidden">
              {/* Header */}
              <button
                type="button"
                onClick={() => toggle(program.id)}
                className="w-full flex justify-between items-center px-4 py-3 bg-[#F9F8F8]"
              >
                <span className="font-semibold">{program.name}</span>

                <div className="flex gap-4 items-center">
                  {isOpen ? <ArrowUp /> : <ArrowDown />}

                  {userRole === ROLES.SUPER_ADMIN && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProgram(program.id);
                      }}
                    >
                      <CloseIcon className="inline-block me-1" />
                      <span className="text-red-500">{t("unassign")}</span>
                    </button>
                  )}
                </div>
              </button>

              {/* Body */}
              {isOpen && (
                <div className="px-6 py-4 space-y-3">
                  {program?.courses?.map((course: any, index: number) => (
                    <div
                      key={course.id}
                      className="flex justify-between items-center bg-[#F7FCFF] p-3 rounded-lg"
                    >
                      <span>
                        {index + 1} - {course.name}
                      </span>

                      {userRole === ROLES.SUPER_ADMIN && (
                        <button
                          onClick={() =>
                            handleRemoveCourse(course.id, program.id)
                          }
                        >
                          <CloseIcon className="inline-block me-1" />
                          <span className="text-red-500">{t("unassign")}</span>
                        </button>
                      )}
                    </div>
                  ))}
                  {program?.courses.length == 0 && (
                    <p className="text-gray-400 text-center">
                      {t("thereAreNoCoursesAvailable")}
                    </p>
                  )}

                  {/* Add Course */}
                  {userRole === ROLES.SUPER_ADMIN && (
                    <button
                      onClick={() => {
                        setActiveProgramId(program.id);
                        setIsCourseModalOpen(true);
                      }}
                      className="w-full mt-3 dashed-border py-2 rounded-lg text-gray-500 flex justify-center gap-2"
                    >
                      {t("addCourse")}
                      <PlusIconGray />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== Modals ===== */}
      <AddCourseToInstituteProgram
        programId={activeProgramId}
        reviewModalOpen={isCourseModalOpen}
        setReviewModalOpen={setIsCourseModalOpen}
      />

      <AddProgramToInstitute
        reviewModalOpen={isProgramModalOpen}
        setReviewModalOpen={setIsProgramModalOpen}
      />
    </div>
  );
};

export default ProgramsInInstitute;
