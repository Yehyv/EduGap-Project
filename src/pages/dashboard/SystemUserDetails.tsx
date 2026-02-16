import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { Link, useParams } from "react-router-dom";
import PencilIcon from "@/assets/svgs/PencilIcon.svg?react";
import { useQuery } from "@tanstack/react-query";
import { findOneSystemUser } from "@/features/Dashboard/services/dashboardApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CircleLoader from "@/shared/components/ui/CircleLoader";

const SystemUserDetails = () => {
  const { systemUserId } = useParams();
  const { t } = useLanguage();

  /* ================= QUERY ================= */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["systemUserDetails", systemUserId],
    queryFn: () => findOneSystemUser(systemUserId ?? ""),
    enabled: !!systemUserId,
  });

  const systemUser = data?.data;
  const isActive = Boolean(systemUser?.is_active);

  if (isLoading) {
    return <CircleLoader />;
  }

  if (isError)
    return (
      <ErrorMessage
        message={error?.message ?? "Error While Fetching Expert Data"}
      />
    );

  return (
    <>
      <DashboardPageTitle
        text={`${systemUser?.full_name ?? "System user details"}`}
        button
        moreStyle="!from-[#F6F6F6] !to-[#F6F6F6] border border-secondary py-0.5"
        buttonText={
          <Link
            to={`/dashboard/system-users/edit-user/${systemUserId}`}
            className="center"
          >
            <PencilIcon className="h-8 mx-2" />
            <span className="inline-block me-4 text-secondary">
              Edit System User Data
            </span>
          </Link>
        }
      />

      {/* ================= STUDENT DATA ================= */}
      <div className="bg-white rounded-lg p-5 mt-3">
        <div className="flex justify-between border-b pb-2 mb-4 border-[#ACACAC]">
          <h5 className="text-secondary font-bold">User Data</h5>
          {/* 
          <button
            className={`px-6 py-1 rounded-full border font-medium text-sm relative ${
              isActive
                ? "border-green-500 text-green-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {isActive ? t("active") : t("inactive")}
            <span
              className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="text-[#444444] text-sm">Full Name</h6>
            <p>{systemUser?.full_name || "-"}</p>
          </div>
          <div className="row-span-3">
            <h6 className="text-[#444444] text-sm mb-3">{t("expertImage")}</h6>
            {systemUser?.user_image && (
              <img
                className="max-h-50 rounded-2xl"
                src={systemUser.user_image}
                alt="systemUser"
              />
            )}
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">Email</h6>
            <p>{systemUser?.email || "-"}</p>
          </div>
          <div>
            <h6 className="text-[#444444] text-sm">Username</h6>
            <p>{systemUser?.username || "-"}</p>
          </div>
          <div>
            <h6 className="text-[#444444] text-sm">Role</h6>
            <p>{systemUser?.SysUserrole?.role_title || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">National ID</h6>
            <p>{systemUser?.national_id || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">Phone</h6>
            <span>+{systemUser?.phone_key ?? ""}</span>{" "}
            <span>{systemUser?.phone ?? ""}</span>
          </div>
          <div>
            <h6 className="text-[#444444] text-sm">{t("created_at")}</h6>
            <p>{systemUser?.created_at || "-"}</p>
          </div>

          <div>
            <h6 className="text-[#444444] text-sm">Updated At</h6>
            <p>{systemUser?.updated_at || "-"}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemUserDetails;
