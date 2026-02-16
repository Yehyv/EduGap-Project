import DataField from "../DataField";
import type { ProgramData, Translation } from "./types";

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
            {programData?.logo && (
              <img
                className="max-h-32 object-contain rounded-xl shadow-md"
                src={programData?.logo}
                alt="Program Logo"
              />
            )}
          </div>

          <DataField label="الوصف" value={programDataAr?.description} />

          <DataField
            label="تاريخ الاضافة"
            value={programData?.createdAt || "-"}
          />

          <DataField
            label="تم الإنشاء بواسطة"
            value={programData.createdBy?.full_name || "-"}
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

export default InformationTab;
