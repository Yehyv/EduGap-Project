import { useState, useMemo, useEffect, useRef } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteStudent,
  getAllPrograms,
  getInstituteStaff,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { Link, useParams } from "react-router-dom";
import type { User } from "@/features/Dashboard/types/dashboardTypes";
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
    selector: (_: User, index: number) => index + 1,
    sortable: false,
    width: "60px",
    style: { justifyContent: "center" },
  },
  {
    name: "Photo",
    cell: (row: User) => (
      <img
        src={row.image || "/default-avatar.png"}
        alt={row.full_name}
        className="w-12 h-12 rounded-full object-cover"
      />
    ),
    sortable: false,
    minWidth: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    cell: (row: User) => (
      <Link
        className="underline text-sm hover:text-secondary"
        to={`/dashboard/users/${row.id}`}
      >
        {row?.name || "-"}
      </Link>
    ),
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "User Role",
    selector: (row: User) => row?.role ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Phone",
    selector: (row: User) => row?.phone ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Created At",
    selector: (row: User) =>
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Status",
    style: { justifyContent: "center" },
    cell: (row: User) => {
      const isActive = row?.is_active;
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
            className={`absolute w-1.5 h-1.5 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
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
    cell: (row: User) => (
      <Link
        to={`/dashboard/users/edit/${row.id}`}
        className="cursor-pointer hover:opacity-70"
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
    cell: (row: User) => (
      <DeleteButton
        deleteApi={() => deleteStudent(row.id)}
        successMessage="Staff member deleted successfully"
        errorMessage="Error occurred during deletion"
        refetchFunction="getInstituteStaff"
      />
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "60px",
  },
];

const InstituteStaffList = () => {
  const [filterText, setFilterText] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const { instituteId } = useParams();

  // Use separate state for staff filters (not URL-based to avoid conflicts with students)
  const [staffProgramId, setStaffProgramId] = useState("");
  const [staffIsActive, setStaffIsActive] = useState("");

  // Temporary filter states for editing
  const [tempProgramId, setTempProgramId] = useState("");
  const [tempIsActive, setTempIsActive] = useState("");

  // Fetch all programs for the institute
  const { data: allProgramsInInstitute, isLoading: programsLoading } = useQuery(
    {
      queryKey: ["getAllPrograms", instituteId],
      queryFn: () => getAllPrograms(instituteId ?? ""),
      enabled: !!instituteId,
    },
  );

  // Fetch institute staff with filters
  const { data: instituteStaffData, isLoading: staffLoading } = useQuery({
    queryKey: ["getInstituteStaff", instituteId, staffProgramId, staffIsActive],
    queryFn: () =>
      getInstituteStaff(instituteId ?? "", {
        programId: staffProgramId,
        isActive: staffIsActive,
      }),
    enabled: !!instituteId,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
        // Reset temp values
        setTempProgramId(staffProgramId);
        setTempIsActive(staffIsActive);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown, staffProgramId, staffIsActive]);

  const filteredItems = useMemo(() => {
    if (!instituteStaffData?.data?.data) return [];
    return instituteStaffData.data.data.filter((item) =>
      item?.name?.toLowerCase().includes(filterText?.toLowerCase()),
    );
  }, [filterText, instituteStaffData]);

  const handleApplyFilters = () => {
    setStaffProgramId(tempProgramId);
    setStaffIsActive(tempIsActive);
    setShowFilterDropdown(false);
  };

  const handleClearFilters = () => {
    setTempProgramId("");
    setTempIsActive("");
    setStaffProgramId("");
    setStaffIsActive("");
  };

  const hasActiveFilters = staffProgramId || staffIsActive;

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start md:items-center w-full">
        {/* Left side - Search and Filter */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name"
              className="border py-2 border-[#ACACAC] w-full h-9 px-10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <span className="absolute start-2 top-1/2 -translate-y-1/2">
              <SearchIcon className="w-7 h-7" />
            </span>
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`border gap-1 flex items-center justify-center py-2 h-9 px-4 rounded-2xl text-sm whitespace-nowrap transition-colors ${
                hasActiveFilters
                  ? "border-secondary text-secondary bg-secondary/5"
                  : "border-[#ACACAC] text-[#ACACAC] hover:border-secondary hover:text-secondary"
              }`}
            >
              <FilterIcon />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="ml-1 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {[staffProgramId, staffIsActive].filter(Boolean).length}
                </span>
              )}
            </button>

            {showFilterDropdown && (
              <div className="fixed md:absolute top-auto md:top-full left-4 right-4 md:left-0 md:right-auto mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-auto md:w-64">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">
                    Filter Staff
                  </h3>

                  {/* Program Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program
                    </label>
                    <select
                      value={tempProgramId}
                      onChange={(e) => setTempProgramId(e.target.value)}
                      disabled={programsLoading}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-100"
                    >
                      <option value="">All Programs</option>
                      {allProgramsInInstitute?.data?.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={tempIsActive}
                      onChange={(e) => setTempIsActive(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="">All Status</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="flex-1 px-3 py-1.5 text-sm bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    filterText,
    showFilterDropdown,
    tempProgramId,
    tempIsActive,
    hasActiveFilters,
    programsLoading,
    allProgramsInInstitute,
  ]);

  return (
    <>
      <DashboardPageTitle text="Institute Staff" />
      <div className="w-full">
        <DataTable
          columns={columns}
          data={filteredItems}
          highlightOnHover
          customStyles={customStyles}
          progressPending={staffLoading}
          subHeader
          subHeaderComponent={subHeaderComponent}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          progressComponent={<CircleLoader />}
          noDataComponent={
            <div className="py-8 text-gray-500">No staff members found</div>
          }
        />
      </div>
    </>
  );
};

export default InstituteStaffList;
