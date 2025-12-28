import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteProgram,
  getProgramsForAdmin,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { Link } from "react-router-dom";
import type {
  ProgramsForAdmin,
  User,
} from "@/features/Dashboard/types/dashboardTypes";
import CircleLoader from "@/shared/components/ui/CircleLoader";

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

const columns = [
  {
    name: "Num",
    selector: (_: ProgramsForAdmin, index: number) => index + 1,
    sortable: false,
    width: "60px",
    style: { justifyContent: "center" },
  },
  {
    name: "Photo",
    selector: (row: ProgramsForAdmin) => (
      <img src={row.name} alt={row.name} className="w-12 h-12 rounded-full" />
    ),
    sortable: false,
    minWidth: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    selector: (row: ProgramsForAdmin) => (
      <Link
        className="underline text-sm"
        to={`/admin-program-details/${row.id}`}
      >
        {row?.name}
      </Link>
    ),
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Created At",
    selector: (row: ProgramsForAdmin) => row?.createdAt ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },

  {
    name: "Is Active",
    style: { justifyContent: "center" },
    cell: (row: ProgramsForAdmin) => {
      const isActive = row?.isActive;
      return (
        <button
          className={`px-6 py-1 text-nowrap rounded-full border font-medium text-sm relative ${
            isActive
              ? "border-green-500 text-green-500"
              : "border-red-500 text-red-500"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
          <span
            className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
              isActive ? " bg-green-500" : " bg-red-500"
            }`}
          ></span>
        </button>
      );
    },
    sortable: true,
  },

  {
    name: "Edit",
    style: { justifyContent: "center" },
    cell: (row: User) => (
      <Link to={`/edit-program/${row.id}`} className="cursor-pointer">
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
    cell: (row: User) => (
      <DeleteButton
        deleteApi={() => deleteProgram(row.id)}
        successMessage="تم حذف البرنامج بنجاح"
        errorMessage="حدث خطأ أثناء الحذف"
        refetchFunction="getProgramsForAdmin"
      />
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "60px",
  },
];

const AdminProgramsList = () => {
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["getProgramsForAdmin"],
    queryFn: () => getProgramsForAdmin(),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!studentsData?.data) return [];
    return studentsData?.data?.filter((item) =>
      item?.name?.toLowerCase().includes(filterText?.toLowerCase())
    );
  }, [filterText, studentsData]);

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
        text="Programs"
        button
        buttonText={
          <Link to={"/add-new-program"} className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="inline-block me-4 text-white">
              Add New Program
            </span>
          </Link>
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
          progressComponent={<CircleLoader />}
        />
      </div>
    </>
  );
};
export default AdminProgramsList;
