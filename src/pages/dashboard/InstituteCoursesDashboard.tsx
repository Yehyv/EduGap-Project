import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteInstitute,
  getInstitutesCoursesForDashboard,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { Link } from "react-router-dom";

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
    selector: (row, index) => index + 1,
    sortable: false,
    width: "40px",
    style: { justifyContent: "center" },
  },
  {
    name: "Photo",
    selector: (row) => (
      <img src={row.image} alt={row.name} className="w-12 h-12 rounded-full" />
    ),
    sortable: false,
    minWidth: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Contents Included",
    selector: (row) => row?.contents ?? 0,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Duration",
    selector: (row) => row?.duration ?? 0,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Created At",
    selector: (row) => row.createdAt ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },

  {
    name: "Is Active",
    style: { justifyContent: "center" },
    cell: (row) => {
      const isActive = row?.isActive;
      return (
        <button
          className={`px-6 py-1 rounded-full border font-medium text-sm relative ${
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
    cell: (row) => (
      <Link to={`/edit-institute/${row.id}`} className="cursor-pointer">
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
    cell: (row) => (
      <DeleteButton
        deleteApi={() => deleteInstitute(row.id)}
        successMessage="تم حذف المستخدم بنجاح"
        errorMessage="حدث خطأ أثناء الحذف"
        refetchFunction="getInstitutesForDashboard"
      />
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "60px",
  },
];

const InstituteCoursesDashboard = () => {
  const { data: InstitutesData, isLoading } = useQuery({
    queryKey: ["getInstitutesCoursesForDashboard"],
    queryFn: () => getInstitutesCoursesForDashboard(),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!InstitutesData?.data) return [];
    return InstitutesData.data.filter(
      (item) =>
        item.name.toLowerCase().includes(filterText.toLowerCase()) ||
        item.location.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [filterText, InstitutesData]);

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
        text="Institutes Courses"
        button
        buttonText={
          <Link to={"/add-new-institute-course"} className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="inline-block me-4 text-white">Add New Course</span>
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
        />
      </div>
    </>
  );
};
export default InstituteCoursesDashboard;
