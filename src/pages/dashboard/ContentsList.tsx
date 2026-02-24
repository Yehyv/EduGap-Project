import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  getConentsList,
  trainingCourseToggle,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { Link } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import type { Content } from "@/features/Dashboard/types/dashboardTypes";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";
import { useAuth } from "@/features/auth/context/AuthContext";
import { SUPER_AND_ADMIN } from "@/shared/utils/globals";
import { jwtDecode } from "jwt-decode";

const customStyles = {
  rows: { style: { minHeight: "48px" } },
  subHeader: { style: { borderRadius: "12px 12px 0px 0px" } },
  pagination: { style: { borderRadius: "0px 0px 12px 12px" } },
  headCells: {
    style: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#333",
      paddingTop: "14px",
      paddingBottom: "14px",
      justifyContent: "center",
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      paddingTop: "12px",
      paddingBottom: "12px",
      textAlign: "center",
    },
  },
};

const ContentsList = () => {
  const { dashboardToken } = useAuth();
  const { role } = jwtDecode(dashboardToken);
  const allowed = SUPER_AND_ADMIN.includes(role);
  const columns = [
    {
      name: "Num",
      selector: (_, index: number) => index + 1,
      sortable: false,
      width: "60px",
      style: { justifyContent: "center" },
    },
    {
      name: "Logo",
      selector: (row: Content) => (
        <img src={row.logo} alt={row.name} className="w-12 h-12 rounded-full" />
      ),
      sortable: false,
      minWidth: "80px",
      style: { justifyContent: "center" },
    },
    {
      name: "Name",
      selector: (row: Content) => (
        <Link
          className="underline text-sm"
          to={`/dashboard/contents/${row.id}`}
        >
          {row?.name}
        </Link>
      ),
      sortable: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Category",
      selector: (row: Content) => row?.categoryName,
      sortable: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Level",
      selector: (row: Content) => row?.level,
      sortable: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Created At",
      selector: (row: Content) => row?.createdAt ?? "-",
      sortable: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Is Active",
      selector: (row: Content) =>
        allowed ? (
          <ActiveStatusButton
            isActive={row?.isActive}
            itemId={row?.id}
            itemName={row?.full_name}
            activateApi={trainingCourseToggle}
            deactivateApi={trainingCourseToggle}
            refetchKey={["getContentsForDashboard"]}
            showModal={false}
            onError={(error, isActivating) => {
              console.error(
                `Failed to ${isActivating ? "activate" : "deactivate"}:`,
                error,
              );
            }}
          />
        ) : (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row?.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row?.isActive ? "Active" : "Inactive"}
          </span>
        ),
      sortable: true,
      center: true,
    },
    ...(allowed
      ? [
          {
            name: "Edit",
            style: { justifyContent: "center" },
            cell: (row: Content) => (
              <Link
                to={`/dashboard/contents/edit/${row?.id}`}
                className="cursor-pointer"
              >
                <EditIcon />
              </Link>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: "50px",
          },
          {
            name: "Delete",
            style: { justifyContent: "center" },
            cell: (row: Content) => (
              <DeleteButton
                successMessage="تم حذف المعهد بنجاح"
                errorMessage="حدث خطأ أثناء الحذف"
                refetchFunction="getContentsForDashboard"
              />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: "60px",
          },
        ]
      : []),
  ];

  const { data: contentsData, isLoading } = useQuery({
    queryKey: ["getContentsForDashboard"],
    queryFn: () => getConentsList(),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!contentsData?.data) return [];
    return contentsData.data.filter((item: Content) =>
      item.name.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [filterText, contentsData]);

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="flex gap-2 max-md:justify-center max-md:w-full">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name"
            className="border py-2 border-[#ACACAC] w-full h-9 px-10 rounded-2xl text-sm focus:outline-none"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <button
            type="button"
            className="absolute start-2 top-1/2 -translate-y-1/2"
          >
            <SearchIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="border text-[#ACACAC] gap-1 center py-2 border-[#ACACAC] h-9 px-4 rounded-2xl text-sm focus:outline-none">
          <FilterIcon />
          <span>Filter</span>
        </div>
      </div>
    );
  }, [filterText]);

  return (
    <>
      <DashboardPageTitle
        text="Training Courses"
        button
        buttonText={
          allowed ? (
            <Link to={"/dashboard/contents/add"} className="center">
              <PlusIcon className="mt-1.5 h-8" />
              <span className="inline-block me-4 text-white">
                Add New Training Courses
              </span>
            </Link>
          ) : (
            <></>
          )
        }
      />
      <div className="w-full overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredItems}
          highlightOnHover
          customStyles={customStyles}
          progressPending={isLoading}
          subHeader
          subHeaderComponent={subHeaderComponent}
          pagination
          pa
          progressComponent={<CircleLoader />}
        />
      </div>
    </>
  );
};
export default ContentsList;
