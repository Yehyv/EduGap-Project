import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import {
  deleteCourseFromProgram,
  getCoursesInProgramV2,
  programDetailsForAdmin,
  getProgramInstitutes,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import AssignCourseToProgram from "@/features/Dashboard/components/AssignCourseToProgram";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { Building2, Users, BookOpen } from "lucide-react";

type TabType = "information" | "courses" | "institutes";

interface Translation {
  name: string;
  description: string;
}

interface ProgramData {
  id: string;
  logo: string;
  is_active: boolean;
  createdAt?: string;
  createdBy?: string;
  translations: Translation[];
}

interface CourseInProgram {
  id: string;
  name: string;
}

interface Institute {
  instituteId: number;
  logo: string;
  name: string;
  coursesCount: number;
  studentsCount: number;
}

const AdminProgramDetails = () => {
  const { programId } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("information");
  const [assignCourseModalOpen, setAssignCourseModalOpen] = useState(false);

  /* ================= QUERIES ================= */
  const { data, isLoading, error } = useQuery({
    queryKey: ["programDetails", programId],
    queryFn: () => programDetailsForAdmin(programId ?? ""),
    enabled: !!programId,
  });

  const { data: coursesInProgramData } = useQuery({
    queryKey: ["coursesInProgram", programId],
    queryFn: () => getCoursesInProgramV2(programId ?? ""),
    enabled: !!programId,
  });

  const { data: institutesData, isLoading: institutesLoading } = useQuery({
    queryKey: ["programInstitutes", programId],
    queryFn: () => getProgramInstitutes(programId ?? ""),
    enabled: !!programId,
  });

  const programData: ProgramData | undefined = data?.data;
  const programDataAr = programData?.translations?.[0];
  const programDataEn = programData?.translations?.[1];
  const coursesInProgram: CourseInProgram[] =
    coursesInProgramData?.data?.data || [];
  const institutes: Institute[] = institutesData?.data || [];

  /* ================= LOADING & ERROR STATES ================= */
  if (isLoading) return <CircleLoader />;

  if (error) {
    return (
      <ErrorMessage
        message={error?.message || "Error while fetching program details"}
      />
    );
  }

  if (!programData) {
    return <ErrorMessage message="Program not found" />;
  }

  /* ================= TAB STYLING ================= */
  const tabClass = (tab: TabType) =>
    `rounded-lg border flex-1 py-2.5 px-4 cursor-pointer transition-all font-medium ${
      activeTab === tab
        ? "border-none text-secondary bg-secondary/5 shadow-sm"
        : "border-gray-300 border text-gray-600  hover:text-secondary/70"
    }`;

  return (
    <div className="space-y-5">
      {/* ================= HEADER ================= */}
      <DashboardPageTitle
        text={
          <div className="flex items-center gap-3">
            {programData.logo && (
              <img
                className="max-h-10 object-contain rounded-xl"
                src={programData.logo}
                alt="Program Logo"
              />
            )}
            <span>{programDataAr?.name} - Program</span>
          </div>
        }
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link
            to={`/dashboard/programs/edit/${programData.id}`}
            className="flex items-center gap-2"
          >
            <EditIcon className="h-8" />
            <span className="text-secondary">Edit Program Details</span>
          </Link>
        }
      />

      {/* ================= TABS ================= */}
      <div className="flex gap-4">
        <button
          className={tabClass("information")}
          onClick={() => setActiveTab("information")}
        >
          Information
        </button>

        <button
          className={tabClass("courses")}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>

        <button
          className={tabClass("institutes")}
          onClick={() => setActiveTab("institutes")}
        >
          Institutes ({institutes.length})
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {activeTab === "information" && (
        <InformationTab
          programData={programData}
          programDataAr={programDataAr}
          programDataEn={programDataEn}
        />
      )}

      {activeTab === "courses" && (
        <CoursesTab
          coursesInProgram={coursesInProgram}
          programId={programId}
          onAddCourse={() => setAssignCourseModalOpen(true)}
        />
      )}

      {activeTab === "institutes" && (
        <InstitutesTab institutes={institutes} isLoading={institutesLoading} />
      )}

      {/* ================= MODALS ================= */}
      <AssignCourseToProgram
        reviewModalOpen={assignCourseModalOpen}
        setReviewModalOpen={setAssignCourseModalOpen}
        programId={programId}
      />
    </div>
  );
};

/* ================= INFORMATION TAB ================= */
interface InformationTabProps {
  programData: ProgramData;
  programDataAr?: Translation;
  programDataEn?: Translation;
}

const InformationTab = ({
  programData,
  programDataAr,
  programDataEn,
}: InformationTabProps) => {
  return (
    <div className="space-y-6">
      {/* Arabic Data Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h5 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-3 mb-4">
          بيانات البرنامج
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 md:auto-rows-min gap-6">
          <DataField label="اسم البرنامج" value={programDataAr?.name} />

          <div className="md:row-span-2 self-start">
            <h6 className="text-sm font-bold text-gray-700 mb-3">
              لوجو البرنامج
            </h6>
            {programData.logo && (
              <img
                className="max-h-32 object-contain rounded-xl shadow-md"
                src={programData.logo}
                alt="Program Logo"
              />
            )}
          </div>

          <DataField label="الوصف" value={programDataAr?.description} />

          <DataField
            label="تاريخ الاضافة"
            value={programData.createdAt || "-"}
          />

          <DataField
            label="تم الإنشاء بواسطة"
            value={programData.createdBy || "-"}
          />
        </div>
      </div>

      {/* English Data Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h5 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-3 mb-4">
          بيانات البرنامج باللغة الإنجليزية
        </h5>

        <div className="grid grid-cols-1 gap-6">
          <DataField label="اسم البرنامج" value={programDataEn?.name} />
          <DataField label="الوصف" value={programDataEn?.description} />
        </div>
      </div>
    </div>
  );
};

/* ================= COURSES TAB ================= */
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
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h5 className="text-lg font-semibold text-secondary">
          المقررات الدراسية المرتبطة بالبرنامج
        </h5>
        <button
          onClick={onAddCourse}
          className="bg-gradient-to-r from-[#FCB737] to-[#BB831A] flex items-center gap-2 py-2 px-4 rounded-xl shadow-md hover:to-[#FCB737] transition text-white text-sm font-medium"
        >
          <PlusIcon className="h-5" />
          <span>Add Course To Program</span>
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
                deleteApi={() => deleteCourseFromProgram(course.id, programId)}
                successMessage="Course removed successfully"
                errorMessage="Error while deleting the course"
                refetchFunction="coursesInProgram"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No courses available</p>
          <button
            onClick={onAddCourse}
            className="text-secondary hover:underline text-sm"
          >
            Add your first course
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= INSTITUTES TAB ================= */
interface InstitutesTabProps {
  institutes: Institute[];
  isLoading: boolean;
}

const InstitutesTab = ({ institutes, isLoading }: InstitutesTabProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-center items-center py-12">
          <CircleLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex gap-2 items-center mb-6">
        <Building2 className="w-6 h-6 text-secondary" />
        <h5 className="text-lg font-semibold text-secondary">
          المعاهد المشاركة في البرنامج
        </h5>
      </div>

      {institutes.length > 0 ? (
        <>
          <p className="text-gray-600 mb-6">
            يتم تقديم هذا البرنامج من خلال {institutes.length}{" "}
            {institutes.length === 1 ? "معهد" : "معاهد"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutes.map((institute, index) => (
              <Link
                key={`${institute.instituteId}-${index}`}
                to={`/dashboard/institutes/${institute.instituteId}`}
                className="group"
              >
                <div className="p-4 rounded-lg hover:bg-gray-50 transition-all border border-gray-100 hover:border-secondary/30 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    {/* Institute Logo */}
                    <div className="flex-shrink-0">
                      {institute.logo ? (
                        <img
                          src={institute.logo}
                          alt={institute.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-secondary" />
                        </div>
                      )}
                    </div>

                    {/* Institute Info */}
                    <div className="flex-1 min-w-0">
                      <h6 className="font-semibold text-gray-800 mb-2 group-hover:text-secondary transition-colors truncate">
                        {institute.name}
                      </h6>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-secondary" />
                          <span>
                            {institute.coursesCount}{" "}
                            {institute.coursesCount === 1
                              ? "Course"
                              : "Courses"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-secondary" />
                          <span>
                            {institute.studentsCount}{" "}
                            {institute.studentsCount === 1
                              ? "Student"
                              : "Students"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-secondary"
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
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            لا توجد معاهد مرتبطة بهذا البرنامج
          </p>
          <p className="text-gray-400 text-sm">
            سيتم عرض المعاهد هنا عند إضافتها للبرنامج
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

export default AdminProgramDetails;
