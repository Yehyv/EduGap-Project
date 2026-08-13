import { Link } from "react-router-dom";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import type { ProgramData, Translation } from "./types";
import { useLanguage } from "@/shared/localization/useLanguage";

interface ProgramHeaderProps {
  programData: ProgramData;
  programDataAr?: Translation;
}

const ProgramHeader = ({ programData, programDataAr }: ProgramHeaderProps) => {
  const { t } = useLanguage();
  return (
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
          <span>
            {programDataAr?.name} - {t("program")}
          </span>
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
          <span className="text-secondary">{t("edit_program")}</span>
        </Link>
      }
    />
  );
};

export default ProgramHeader;
