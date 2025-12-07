import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { getInstitutes } from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import DeleteIcon from "@/assets/svgs/TrashIconDashboard.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";

const customStyles = {
  rows: { style: { minHeight: "48px" } },
  subHeader: {
    style: {
      borderRadius: "12px 12px 0px 0px",
    },
  },
  pagination: {
    style: {
      borderRadius: "0px 0px 12px 12px",
    },
  },
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
    sortable: true,
    width: "60px",
    style: { justifyContent: "center", borderRight: "1px solid #D1D5DB" },
  },
  {
    name: "Logo",
    selector: (row) => (
      <img
        src={row.logo}
        alt={row.translation.name}
        className="w-12 h-12 rounded-full"
      />
    ),
    sortable: false,
    width: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    selector: (row) => row.translation.name,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Created At",
    selector: (row) => row.createdAt,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Location",
    selector: (row) => row.location,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Is Active",
    style: { justifyContent: "center" },
    cell: (row) => {
      const isActive = row.translations[0].language.isActive;
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
    name: "Phone",
    style: { justifyContent: "center" },
    selector: (row) => `${row.phone_key} ${row.phone}`,
  },
  {
    name: "Edit",
    style: { justifyContent: "center" },
    cell: (row) => (
      <button className="cursor-pointer">
        <EditIcon />
      </button>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "60px",
  },
  {
    name: "Delete",
    style: { justifyContent: "center" },
    cell: (row) => (
      <button className="cursor-pointer">
        <DeleteIcon />
      </button>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "60px",
  },
];

const InstitutesPage = () => {
  const { data: InstitutesData, isLoading } = useQuery({
    queryKey: ["getInstitutesForDashboard"],
    queryFn: () => getInstitutes(),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!InstitutesData?.data) return [];
    return InstitutesData.data.filter(
      (item) =>
        item.translation.name
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        item.location.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [filterText, InstitutesData]);

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name"
            className="border py-2 border-[#ACACAC] w-full h-9 px-10 ps-10 rounded-2xl text-sm focus:outline-none"
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
        <div className="border text-[#ACACAC] gap-1 center py-2 border-[#ACACAC] h-9 px-4  rounded-2xl text-sm focus:outline-none">
          <FilterIcon />
          <span>Filter</span>
        </div>
      </div>
    );
  }, [filterText]);

  return (
    <>
      <DashboardPageTitle
        text="Institutes"
        button
        buttonText={
          <span className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="inline-block me-4">Add New Institute</span>
          </span>
        }
      />
      <div className="w-full overflow-x-auto m-0 !p-0">
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          progressPending={isLoading}
          subHeader
          subHeaderComponent={subHeaderComponent}
        />
      </div>
    </>
  );
};

export default InstitutesPage;
