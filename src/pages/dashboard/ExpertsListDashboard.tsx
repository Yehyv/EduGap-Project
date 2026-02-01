import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteExpert,
  getExpertsForDashboard,
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
import type { ExpertTypeForDashboard } from "@/features/Dashboard/types/dashboardTypes";

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
    selector: (row: ExpertTypeForDashboard) => (
      <img
        src={row.image}
        alt={row.user.full_name}
        className="w-12 h-12 rounded-full"
      />
    ),
    minWidth: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    selector: (row: ExpertTypeForDashboard) => (
      <Link className="underline text-sm" to={`/dashboard/experts/${row.id}`}>
        {row.user.full_name}
      </Link>
    ),
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Title",
    selector: (row: ExpertTypeForDashboard) => row.title,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Created At",
    selector: (row: ExpertTypeForDashboard) => row.created_at,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Status",
    style: { justifyContent: "center" },
    cell: (row: ExpertTypeForDashboard) => {
      const isActive = row.is_active;
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
    cell: (row: ExpertTypeForDashboard) => (
      <Link to={`/dashboard/experts/edit/${row.id}`} className="cursor-pointer">
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
    cell: (row: ExpertTypeForDashboard) => (
      <DeleteButton
        deleteApi={() => deleteExpert(row.id)}
        successMessage="تم حذف الخبير بنجاح"
        errorMessage="حدث خطأ أثناء الحذف"
        refetchFunction="getExpertsForDashboard"
      />
    ),
    ignoreRowClick: true,
    button: true,
    minWidth: "60px",
  },
];

const ExpertsListDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["getExpertsForDashboard"],
    queryFn: () => getExpertsForDashboard(),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!data?.data?.items) return [];
    return data?.data.items?.filter((item: ExpertTypeForDashboard) =>
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
        text="Experts"
        button
        buttonText={
          <Link to="/dashboard/experts/add" className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="me-4 text-white">Add New Expert</span>
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

export default ExpertsListDashboard;
