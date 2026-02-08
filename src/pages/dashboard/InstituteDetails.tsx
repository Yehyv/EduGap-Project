import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import EditIcon from "@/assets/svgs/PencilIcon.svg?react";
import { instituteDetails } from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";
import PorgramsInInstitute from "@/features/Dashboard/components/PorgramsInInstitute";
import StudentsInInstitute from "@/features/Dashboard/components/StudentsInInstitute";
import InstituteStuffList from "@/features/Dashboard/components/InstituteStuffList";

const InstituteDetails = () => {
  const { instituteId } = useParams();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("informations");

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["instituteDetailsForDashboard", instituteId],
    queryFn: () => instituteDetails(instituteId ?? ""),
    enabled: !!instituteId,
  });

  const instituteData = data?.data;

  if (isLoading) return <CircleLoader />;
  if (isError)
    return <ErrorMessage message={error?.message ?? t("institute_error")} />;

  const tabClass = (tab: string) =>
    `rounded-lg  w-full py-1 cursor-pointer ${
      activeTab === tab
        ? " bg-secondary/5 text-secondary font-bold"
        : "border border-[#9B9393] text-[#9B9393]"
    }`;

  const instituteDataAr = instituteData?.translations[0];
  const instituteDataEn = instituteData?.translations[1];

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <img
            src={instituteData?.logo}
            className="w-10"
            alt="Institue Logo"
          ></img>
          <h2 className="mb-0">{instituteDataAr?.name ?? ""} </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-6 py-1 text-nowrap rounded-full border font-medium text-sm relative ${
              instituteData?.is_active
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {instituteData?.is_active ? t("active") : t("inactive")}
            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 ${
                instituteData?.is_active ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </button>

          <Link
            to={`/dashboard/institutes/edit/${instituteData?.id}`}
            className="bg-gradient-to-r from-[#F6F6F6] to-[#F6F6F6] border border-secondary py-0.5 px-4 rounded-xl shadow-md flex items-center"
          >
            <EditIcon className="h-8 mx-2" />
            <span className="text-secondary">{t("institute_edit")}</span>
          </Link>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-4 my-5">
        <button
          className={tabClass("students")}
          onClick={() => setActiveTab("students")}
        >
          {t("tabs_students")}
        </button>

        <button
          className={tabClass("informations")}
          onClick={() => setActiveTab("informations")}
        >
          Informations
        </button>

        <button
          className={tabClass("programs")}
          onClick={() => setActiveTab("programs")}
        >
          Programs
        </button>
        <button
          className={tabClass("stuff")}
          onClick={() => setActiveTab("stuff")}
        >
          Institute Stuff
        </button>
      </div>

      {/* ================= DATA TAB ================= */}
      {activeTab === "informations" && (
        <>
          <div className="bg-white p-5 rounded-lg">
            <h5 className="text-secondary font-bold mb-3">
              {t("institute_data_ar")}
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="text-sm font-bold">{t("field_name")}</h6>
                <p>{instituteDataAr?.name}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_region")}</h6>
                <p>{instituteData?.region?.name ?? "-"}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_address")}</h6>
                <p>{instituteDataAr?.address}</p>
              </div>

              <div></div>

              <div>
                <h6 className="text-sm font-bold">{t("field_email")}</h6>
                <p>{instituteData?.email}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_phone")}</h6>
                <p>
                  +{instituteData?.phone_key} {instituteData?.phone}
                </p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("contactPerson")}</h6>
                <p>{instituteDataAr?.contactPersopnName}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">
                  {t("contactPersonPosition")}
                </h6>
                <p>{instituteDataAr?.contactPersonPostion}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold mb-3">{t("logo")}</h6>
                {instituteData?.logo && (
                  <img
                    className="max-h-50 rounded-2xl"
                    src={instituteData.logo}
                    alt="Institute Logo"
                  />
                )}
              </div>

              <div>
                <h6 className="text-sm font-bold mb-3">{t("profileImage")}</h6>
                {instituteData?.image_profile && (
                  <img
                    className="max-h-50 rounded-2xl"
                    src={instituteData.image_profile}
                    alt="Institute Image"
                  />
                )}
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("created_at")}</h6>
                <p>{instituteData?.createdAt}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("created_by")}</h6>
                <p>-</p>
              </div>
            </div>
          </div>

          {/* ===== ENGLISH DATA ===== */}
          <div className="bg-white rounded-lg p-5 mt-3">
            <h5 className="text-secondary font-bold">
              {t("institute_data_en")}
            </h5>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <h6 className="text-sm font-bold">{t("field_name")}</h6>
                <p>{instituteDataEn?.name}</p>
              </div>

              <div>
                <h6 className="text-sm font-bold">{t("field_address")}</h6>
                <p>{instituteDataEn?.address}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= OTHER TABS ================= */}
      {activeTab === "students" && <StudentsInInstitute />}

      {activeTab === "programs" && <PorgramsInInstitute />}
      {activeTab === "stuff" && <InstituteStuffList />}
    </>
  );
};

export default InstituteDetails;
