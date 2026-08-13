import { useParams } from "react-router-dom";
import { useState } from "react";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import AssignCourseToProgram from "@/features/Dashboard/components/AssignCourseToProgram";
import ProgramHeader from "@/features/Dashboard/components/programs/ProgramHeader";
import ProgramTabs from "@/features/Dashboard/components/programs/ProgramTabs";
import InformationTab from "@/features/Dashboard/components/programs/InformationTsb";
import CoursesTab from "@/features/Dashboard/components/programs/CoursesTab";
import InstitutesTab from "@/features/Dashboard/components/programs/InstitutesTab";
import { useProgramData } from "@/features/Dashboard/components/programs/hooks/useProgramData";
import type { TabType } from "@/features/Dashboard/components/programs/types";
import { useLanguage } from "@/shared/localization/useLanguage";

const AdminProgramDetails = () => {
  const { t } = useLanguage();
  const { programId } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("information");
  const [assignCourseModalOpen, setAssignCourseModalOpen] = useState(false);

  /* ================= DATA FETCHING ================= */
  const {
    programData,
    programDataAr,
    programDataEn,
    coursesInProgram,
    institutes,
    isLoading,
    error,
    institutesLoading,
  } = useProgramData(programId);

  /* ================= LOADING & ERROR STATES ================= */
  if (isLoading) return <CircleLoader />;

  if (error) {
    return (
      <ErrorMessage
        message={error?.message || t("errorWhileFetchingProgramDetails")}
      />
    );
  }

  if (!programData) {
    return <ErrorMessage message={t("programNotFound")} />;
  }

  /* ================= HANDLERS ================= */
  const handleAddCourse = () => setAssignCourseModalOpen(true);

  return (
    <div className="space-y-5">
      <ProgramHeader programData={programData} programDataAr={programDataAr} />

      <ProgramTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        coursesCount={coursesInProgram.length}
        institutesCount={institutes.length}
      />

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
          onAddCourse={handleAddCourse}
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

export default AdminProgramDetails;
