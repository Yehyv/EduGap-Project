import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteSystemUser,
  getAllSystemUsers,
  systemUserActiveToggle,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import { Link } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import type { SystemUsers } from "@/features/Dashboard/types/dashboardTypes";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";
import { useLanguage } from "@/shared/localization/useLanguage";

/* ------------------ styles ------------------ */
const customStyles = {
  rows: { style: { minHeight: "48px" } },
  subHeader: { style: { borderRadius: "12px 12px 0px 0px" } },
  pagination: { style: { borderRadius: "0px 0px 12px 12px" } },
  headCells: {
    style: {
      fontSize: "14px",
      fontWeight: "700",
      justifyContent: "center",
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      textAlign: "center",
    },
  },
};

const SystemUsersList = () => {
  const { t } = useLanguage();
  const [filterText, setFilterText] = useState("");

  /* ------------------ columns ------------------ */
  const columns = [
    {
      name: t("num"),
      selector: (_: unknown, index: number) => index + 1,
      width: "60px",
      center: true,
    },
    {
      name: t("image"),
      selector: (row: SystemUsers) => (
        <img
          src={row?.user_image}
          alt={row?.full_name}
          className="w-12 h-12 rounded-full"
        />
      ),
      minWidth: "80px",
      style: { justifyContent: "center" },
    },
    {
      name: t("fullName"),
      selector: (row: SystemUsers) => (
        <Link className="underline" to={`/dashboard/system-users/${row.id}`}>
          {row?.full_name}
        </Link>
      ),
      sortable: true,
      center: true,
    },
    {
      name: t("email"),
      selector: (row: SystemUsers) => row?.email,
      sortable: true,
      center: true,
    },
    {
      name: t("nationalId"),
      selector: (row: SystemUsers) => row?.national_id,
      sortable: true,
      center: true,
    },
    {
      name: t("phone"),
      selector: (row: SystemUsers) => row?.phone,
      sortable: true,
      center: true,
    },
    {
      name: t("role"),
      selector: (row: SystemUsers) => row?.SysUserrole?.role_title,
      sortable: true,
      center: true,
    },
    {
      name: t("institute"),
      selector: (row: SystemUsers) =>
        row?.institute?.translations?.[0]?.name ?? "-",
      sortable: true,
      center: true,
    },
    {
      name: t("createdAt"),
      selector: (row: SystemUsers) => row.created_at,
      sortable: true,
      center: true,
    },
    {
      name: t("updatedAt"),
      selector: (row: SystemUsers) => row.updated_at,
      sortable: true,
      center: true,
    },
    {
      name: t("isActive"),
      selector: (row: SystemUsers) => (
        <ActiveStatusButton
          isActive={row?.is_active}
          itemId={row?.id}
          itemName={row?.full_name}
          activateApi={systemUserActiveToggle}
          deactivateApi={systemUserActiveToggle}
          refetchKey={["getSystemUsersList"]}
          showModal={false}
          onSuccess={(isActivating) => {
            console.log(
              `Course ${isActivating ? "activated" : "deactivated"} successfully`,
            );
          }}
          onError={(error, isActivating) => {
            console.error(
              `Failed to ${isActivating ? "activate" : "deactivate"}:`,
              error,
            );
          }}
        />
      ),
      sortable: true,
      center: true,
    },
    {
      name: t("edit"),
      cell: (row: SystemUsers) => (
        <Link to={`/dashboard/system-users/edit-user/${row.id}`}>
          <EditIcon />
        </Link>
      ),
      button: true,
      center: true,
    },
    {
      name: t("delete"),
      style: { justifyContent: "center" },
      cell: (row: SystemUsers) => (
        <DeleteButton
          deleteApi={() => deleteSystemUser(row.id)}
          successMessage={t("userDeletedSuccessfully")}
          errorMessage={t("errorOccurredDuringDeletion")}
          refetchFunction="getSystemUsersList"
        />
      ),
      ignoreRowClick: true,
      button: true,
      minWidth: "60px",
    },
  ];

  /* ------------------ query ------------------ */
  const { data, isLoading } = useQuery({
    queryKey: ["getSystemUsersList"],
    queryFn: getAllSystemUsers,
  });

  /* ------------------ filtering ------------------ */
  const filteredItems = useMemo(() => {
    if (!data?.data?.users) return [];
    return data.data.users.filter((item: SystemUsers) =>
      item.full_name?.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [data, filterText]);

  /* ------------------ sub header ------------------ */
  const subHeaderComponent = (
    <div className="flex gap-2">
      <div className="relative">
        <input
          type="text"
          placeholder={t("searchByTitle")}
          className="border border-[#ACACAC] h-9 px-10 rounded-2xl text-sm"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <span className="absolute start-2 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </span>
      </div>

      <div className="border border-[#ACACAC] h-9 px-4 rounded-2xl flex items-center gap-1 text-sm">
        <FilterIcon />
        {t("filter")}
      </div>
    </div>
  );

  return (
    <>
      <DashboardPageTitle
        text={t("systemUsers")}
        button
        buttonText={
          <Link to="/dashboard/system-users/add-new-user" className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="me-4 text-white">{t("addNewSystemUser")}</span>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        highlightOnHover
        progressPending={isLoading}
        progressComponent={<CircleLoader />}
        pagination
        subHeader
        subHeaderComponent={subHeaderComponent}
      />
    </>
  );
};

export default SystemUsersList;
