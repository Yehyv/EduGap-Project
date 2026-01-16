import { Link, useParams } from "react-router-dom";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import {
  getCoursesInProgram,
  programDetailsForAdmin,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import ActiveOrInactiveButton from "@/features/Dashboard/components/ActiveOrInactiveButton";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import AssignCourseToProgram from "@/features/Dashboard/components/AssignCourseToProgram";
import { useState } from "react";
const AdminProgramDetails = () => {
  const { programId } = useParams();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  /* ================= QUERY ================= */
  const { data, isLoading, error } = useQuery({
    queryKey: ["programDetails", programId],
    queryFn: () => programDetailsForAdmin(programId ?? ""),
    enabled: !!programId,
  });
  const { data: coursesInProgramData } = useQuery({
    queryKey: ["coursesInProgram", programId],
    queryFn: () => getCoursesInProgram(programId ?? ""),
    enabled: !!programId,
  });
  const programData = data?.data;

  if (isLoading) return <CircleLoader />;
  if (error)
    return (
      <ErrorMessage
        message={error?.message || "Errror While Fetching program details"}
      />
    );

  const isActive = true;
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-1 ">
        <div className="flex items-center gap-3">
          {programData?.logo && (
            <img
              className="max-h-10 object-contain rounded-2xl"
              src={programData?.logo}
              alt="Program Image"
            />
          )}
          <h2 className="mb-5">{programData?.name} - Program</h2>
        </div>
        <button
          type={"button"}
          className={`bg-gradient-to-r cursor-pointer !from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5 text-white px-4 rounded-xl shadow-md transition `}
        >
          <Link to={"/edit-program-details"} className="center">
            <EditIcon className="h-8 mx-2" />

            <span className="inline-block me-4 text-secondary">
              Edit Program Details
            </span>
          </Link>
        </button>
      </div>
      <div className="bg-white rounded-lg px-4">
        <div className="flex items-center justify-between border-b border-[#ACACAC] py-2">
          <h5 className="text-secondary font-bold">بيانات البرنامج</h5>
          <ActiveOrInactiveButton isActive={isActive} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:auto-rows-min gap-4 py-2">
          <div>
            <h6 className="text-[#444444] text-sm font-bold">اسم البرنامج</h6>
            <p>{programData?.name}</p>
          </div>

          <div className="md:row-span-2 self-start">
            <h6 className="text-[#444444] text-sm mb-3 font-bold">
              لوجو البرنامج
            </h6>
            {programData?.logo && (
              <img
                className="max-h-20 object-contain rounded-2xl"
                src={programData?.logo}
                alt="Program Image"
              />
            )}
          </div>

          <div>
            <h6 className="text-[#444444] text-sm font-bold">الوصف</h6>
            <p>{programData?.description}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm font-bold">تاريخ الاضافة</h6>
            <p>-</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm font-bold">
              تم الإنشاء بواسطة
            </h6>
            <p>-</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-5 mt-3">
        <div className="flex justify-between border-b border-[#ACACAC] pb-3">
          <h5 className="text-secondary font-bold">
            بيانات البرنامج باللغة الإنجليزية
          </h5>
        </div>

        {/* Change this Static Data */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <h6 className="text-[#444444] text-sm font-bold">اسم البرنامج </h6>
            <p>-</p>
          </div>
          <div>
            <h6 className="text-[#444444] text-sm font-bold">الوصف </h6>
            <p>-</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 mt-3">
        <div className="flex justify-between border-b border-[#ACACAC] pb-3">
          <h5 className="text-secondary font-bold">
            المقررات الدراسية المرتبطة بالبرنامج
          </h5>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="bg-gradient-to-r from-[#FCB737] to-[#BB831A] center py-1.5 px-3 rounded-xl shadow-md hover:to-[#FCB737] transition text-white text-sm"
          >
            <PlusIcon className="h-5" />
            <span>Add Course To Program</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          {coursesInProgramData?.data.map((c, index) => (
            <div className="flex items-center gap-1">
              <span>{index + 1} - </span>
              <h6 className="text-[#444444] text-sm font-bold"> {c.name}</h6>
            </div>
          ))}
          {coursesInProgramData?.data.length == 0 && (
            <p className="text-center text-gray-400">No data available</p>
          )}
        </div>
      </div>

      <AssignCourseToProgram
        reviewModalOpen={reviewModalOpen}
        setReviewModalOpen={setReviewModalOpen}
        programId={programId}
      />
    </>
  );
};

export default AdminProgramDetails;
