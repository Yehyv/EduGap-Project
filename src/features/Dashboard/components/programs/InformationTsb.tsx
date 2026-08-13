import DataField from "../DataField";
import type { ProgramData, Translation } from "./types";
import { useLanguage } from "@/shared/localization/useLanguage";

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
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Arabic Data Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h5 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-3 mb-4">
          {t("programDataArabic")}
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 md:auto-rows-min gap-6">
          <DataField label={t("programName")} value={programDataAr?.name} />

          <div className="md:row-span-2 self-start">
            <h6 className="text-sm font-bold text-gray-700 mb-3">
              {t("programLogo")}
            </h6>
            {programData?.logo && (
              <img
                className="max-h-32 object-contain rounded-xl shadow-md"
                src={programData?.logo}
                alt="Program Logo"
              />
            )}
          </div>

          <DataField
            label={t("description")}
            value={programDataAr?.description}
          />

          <DataField
            label={t("dateAdded")}
            value={programData?.createdAt || "-"}
          />

          <DataField
            label={t("createdBy")}
            value={programData.createdBy?.full_name || "-"}
          />
        </div>
      </div>

      {/* English Data Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h5 className="text-lg font-semibold text-secondary border-b border-gray-200 pb-3 mb-4">
          {t("programDataEnglish")}
        </h5>

        <div className="grid grid-cols-1 gap-6">
          <DataField label={t("programName")} value={programDataEn?.name} />
          <DataField
            label={t("description")}
            value={programDataEn?.description}
          />
        </div>
      </div>
    </div>
  );
};

export default InformationTab;
