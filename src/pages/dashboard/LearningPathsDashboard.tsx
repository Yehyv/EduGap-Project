import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteLearningPath,
  getLearningPathsForDashboard,
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
import type { LearningPathType } from "@/features/Dashboard/types/dashboardTypes";

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
    selector: (_: unknown, index: number) => index + 1,
    width: "60px",
    style: { justifyContent: "center" },
  },
  {
    name: "Image",
    selector: (row: LearningPathType) => (
      <img src={row.image} alt={row.name} className="w-12 h-12 rounded-full" />
    ),
    minWidth: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    selector: (row: LearningPathType) => (
      <Link
        className="underline text-sm"
        to={`/dashboard/learning-paths/${row.id}`}
      >
        {row.title}
      </Link>
    ),
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Created At",
    selector: (row: LearningPathType) => row.createdAt,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Status",
    style: { justifyContent: "center" },
    cell: (row: LearningPathType) => {
      const isActive = row.isActive;
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
            className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </button>
      );
    },
    sortable: true,
  },
  {
    name: "Edit",
    style: { justifyContent: "center" },
    cell: (row: LearningPathType) => (
      <Link
        to={`/dashboard/learning-paths/edit/${row.id}`}
        className="cursor-pointer"
      >
        <EditIcon />
      </Link>
    ),
    ignoreRowClick: true,
    button: true,
    minWidth: "50px",
  },
  {
    name: "Delete",
    style: { justifyContent: "center" },
    cell: (row: LearningPathType) => (
      <DeleteButton
        deleteApi={() => deleteLearningPath(row.id)}
        successMessage="تم حذف المسار التعليمي بنجاح"
        errorMessage="حدث خطأ أثناء الحذف"
        refetchFunction="getLearningPathsForDashboard"
      />
    ),
    ignoreRowClick: true,
    button: true,
    minWidth: "60px",
  },
];

const LearningPathsDashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["getLearningPathsForDashboard"],
    queryFn: () => getLearningPathsForDashboard(),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((item: LearningPathType) =>
      item.title?.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [filterText, data]);

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
          <span className="absolute start-2 top-1/2 -translate-y-1/2">
            <SearchIcon className="w-7 h-7" />
          </span>
        </div>
        <div className="border text-[#ACACAC] gap-1 center py-2 border-[#ACACAC] h-9 px-4 rounded-2xl text-sm">
          <FilterIcon />
          <span>Filter</span>
        </div>
      </div>
    );
  }, [filterText]);

  return (
    <>
      <DashboardPageTitle
        text="Learning Paths"
        button
        buttonText={
          <Link to="/dashboard/learning-paths/add" className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="me-4 text-white">Add New Learning Path</span>
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

export default LearningPathsDashboardPage;
