import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  instituteActiveToggle,
  instituteDetails,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import ProgramsInInstitute from "@/features/Dashboard/components/ProgramsInInstitute";
import StudentsInInstitute from "@/features/Dashboard/components/StudentsInInstitute";
import InstituteStaffList from "@/features/Dashboard/components/InstituteStaffList";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";

const InstituteDetails = () => {
  const { instituteId } = useParams();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("informations");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["instituteDetailsForDashboard", instituteId],
    queryFn: () => instituteDetails(instituteId ?? ""),
    enabled: !!instituteId,
  });

  const instituteData = data?.data;
  const instituteDataAr = instituteData?.translations?.[0];
  const instituteDataEn = instituteData?.translations?.[1];

  const region = instituteData?.region;
  const city = region?.city;
  const country = city?.country;

  // AR = index 0 | EN = index 1
  const arRegion = [
    country?.translations?.[0]?.name,
    city?.translations?.[0]?.name,
    region?.translations?.[0]?.name,
  ]
    .filter(Boolean)
    .join(" ، ");

  const enRegion = [
    country?.translations?.[1]?.name,
    city?.translations?.[1]?.name,
    region?.translations?.[1]?.name,
  ]
    .filter(Boolean)
    .join(", ");

  if (isLoading) return <CircleLoader />;
  if (isError)
    return <ErrorMessage message={error?.message ?? t("institute_error")} />;

  const tabClass = (tab: string) =>
    `rounded-lg w-full py-1 cursor-pointer transition-colors ${
      activeTab === tab
        ? "bg-secondary/5 text-secondary font-bold"
        : "border border-[#9B9393] text-[#9B9393] hover:border-secondary/50 hover:text-secondary/70"
    }`;

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-1 gap-4">
        <div className="flex items-center gap-2">
          <img
            src={instituteData?.logo}
            className="w-10 h-10 rounded-full object-cover"
            alt="Institute Logo"
          />
          <h2 className="mb-0">{instituteDataAr?.name ?? ""}</h2>
        </div>

        <ActiveStatusButton
          itemId={instituteId ?? ""}
          activateApi={() => instituteActiveToggle(instituteId ?? "")}
          deactivateApi={() => instituteActiveToggle(instituteId ?? "")}
          isActive={instituteData?.is_active ?? false}
          refetchKey={"instituteDetailsForDashboard"}
          showModal={false}
        />
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-4 my-5">
        {["informations", "students", "programs", "staff"].map((tab) => (
          <button
            key={tab}
            className={tabClass(tab)}
            onClick={() => setActiveTab(tab)}
          >
            {t(`tabs_${tab}`) || tab}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────────────────── */}
      {activeTab === "informations" && (
        <>
          {/* Arabic Information */}
          <div className="bg-white p-5 rounded-lg">
            <h5 className="text-secondary font-bold mb-3">
              {t("institute_data_ar")}
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="text-sm font-bold">{t("field_name")}</h6>
                <p>{instituteDataAr?.name || "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_region")}</h6>
                <p>{arRegion || "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_address")}</h6>
                <p>{instituteDataAr?.address || "-"}</p>
              </div>

              <div />

              <div>
                <h6 className="text-sm font-bold">{t("field_email")}</h6>
                <p>{instituteData?.email || "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_phone")}</h6>
                <p>
                  {instituteData?.phone_key && instituteData?.phone
                    ? `+${instituteData.phone_key} ${instituteData.phone}`
                    : "-"}
                </p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("contactPerson")}</h6>
                <p>{instituteDataAr?.contactPersopnName || "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">
                  {t("contactPersonPosition")}
                </h6>
                <p>{instituteDataAr?.contactPersonPostion || "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold mb-3">{t("logo")}</h6>
                {instituteData?.logo ? (
                  <img
                    className="max-h-50 rounded-2xl"
                    src={instituteData.logo}
                    alt="Institute Logo"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">No logo available</p>
                )}
              </div>

              <div>
                <h6 className="text-sm font-bold mb-3">{t("profileImage")}</h6>
                {instituteData?.image_profile ? (
                  <img
                    className="max-h-50 rounded-2xl"
                    src={instituteData.image_profile}
                    alt="Institute Image"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">
                    No profile image available
                  </p>
                )}
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("created_at")}</h6>
                <p>
                  {instituteData?.createdAt
                    ? new Date(instituteData.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("created_by")}</h6>
                <p>{instituteData?.createdBy?.full_name || "-"}</p>
              </div>
            </div>
          </div>

          {/* English Information */}
          <div className="bg-white rounded-lg p-5 mt-3">
            <h5 className="text-secondary font-bold">
              {t("institute_data_en")}
            </h5>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <h6 className="text-sm font-bold">{t("field_name")}</h6>
                <p>{instituteDataEn?.name || "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_address")}</h6>
                <p>{instituteDataEn?.address || "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_region")}</h6>
                <p>{enRegion || "-"}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "students" && <StudentsInInstitute />}
      {activeTab === "programs" && <ProgramsInInstitute />}
      {activeTab === "staff" && <InstituteStaffList />}
    </>
  );
};

export default InstituteDetails;
