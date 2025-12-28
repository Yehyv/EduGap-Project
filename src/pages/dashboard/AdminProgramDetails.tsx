import { Link, useParams } from "react-router-dom";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import { programDetailsForAdmin } from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import ActiveOrInactiveButton from "@/features/Dashboard/components/ActiveOrInactiveButton";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
const AdminProgramDetails = () => {
  const { programId } = useParams();
  /* ================= QUERY ================= */
  const { data, isLoading, error } = useQuery({
    queryKey: ["programDetails", programId],
    queryFn: () => programDetailsForAdmin(programId ?? ""),
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
    </>
  );
};

export default AdminProgramDetails;
