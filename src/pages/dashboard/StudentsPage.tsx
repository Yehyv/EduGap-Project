import { useState, useMemo, useEffect, useRef } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  activateStudent,
  deactivateStudent,
  deleteStudent,
  getStudents,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { Link, useSearchParams } from "react-router-dom";
import type { User } from "@/features/Dashboard/types/dashboardTypes";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";

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
    selector: (row: User) => (
      <img
        src={row.user_image}
        alt={row.full_name}
        className="w-12 h-12 rounded-full"
      />
    ),
    sortable: false,
    minWidth: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    selector: (row: User) => (
      <Link
        className="underline text-sm"
        to={`/dashboard/users/${row?.id}/institutes/${row?.instituteId}`}
      >
        {row?.name}
      </Link>
    ),
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "User Role",
    selector: (row: User) => row?.role?.role_title ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Institute",
    selector: (row: User) => row?.institute ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Phone",
    selector: (row: User) => row?.phone ?? 0,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Created At",
    selector: (row: User) => row.createdAt ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Is Active",
    style: { justifyContent: "center" },
    cell: (row: User) => {
      const isActive = row?.is_active;
      return (
        <ActiveStatusButton
          itemId={row?.id}
          activateApi={activateStudent}
          deactivateApi={deactivateStudent}
          isActive={isActive ?? false}
          refetchKey={"getStudents"}
          showModal={true}
        />
      );
    },
    sortable: true,
  },
  {
    name: "Edit",
    style: { justifyContent: "center" },
    cell: (row: User) => (
      <Link to={`/dashboard/users/edit/${row.id}`} className="cursor-pointer">
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
        successMessage="تم حذف الطالب بنجاح"
        errorMessage="حدث خطأ أثناء الحذف"
        refetchFunction="getStudents"
      />
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    minWidth: "60px",
  },
];

const StudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterText, setFilterText] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const roleCategory = searchParams.get("roleCategory") || "";

  const [tempRoleCategory, setTempRoleCategory] = useState(roleCategory);

  useEffect(() => {
    setTempRoleCategory(roleCategory);
  }, [roleCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
        setTempRoleCategory(roleCategory);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown, roleCategory]);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["getStudents", roleCategory, currentPage, perPage, filterText],
    queryFn: () => getStudents(roleCategory, currentPage, perPage, filterText),
    keepPreviousData: true,
  });

  const rolesData = [
    {
      name: "Portal",
      value: 0,
    },
    {
      name: "Dashboard",
      value: 1,
    },
  ];

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handlePerRowsChange = (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (tempRoleCategory) params.set("roleCategory", tempRoleCategory);
    setSearchParams(params);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setTempRoleCategory("");
  };

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="flex gap-2 max-md:justify-center max-md:w-full">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name"
            className="border py-2 border-[#ACACAC] w-full h-9 px-10 rounded-2xl text-sm focus:outline-none"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1); // Reset to first page when search changes
            }}
          />
          <button
            type="button"
            className="absolute start-2 top-1/2 -translate-y-1/2"
          >
            <SearchIcon className="w-7 h-7" />
          </button>
        </div>

        {/* Filter Dropdown */}
        <div className="relative z-10" ref={filterDropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="border text-[#ACACAC] gap-1 flex items-center justify-center py-2 border-[#ACACAC] h-9 px-4 rounded-2xl text-sm focus:outline-none"
          >
            <FilterIcon />
            <span>Filter</span>
          </button>

          {showFilterDropdown && (
            <>
              {/* Backdrop for mobile */}
              <div className="fixed inset-0 bg-black/20 md:hidden z-40" />

              {/* Dropdown */}
              <div className="fixed md:absolute left-1/2 md:-left-40 top-1/2 md:top-full -translate-x-1/2 md:translate-x-0 -translate-y-1/2 md:translate-y-0 mt-0 md:mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-[90vw] max-w-sm md:w-64">
                <div className="space-y-3">
                  {/* Role Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Category
                    </label>
                    <select
                      value={tempRoleCategory}
                      onChange={(e) => setTempRoleCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="">All Roles</option>
                      {rolesData?.map((role: any) => (
                        <option key={role.value} value={role.value}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="flex-1 px-3 py-1.5 text-sm bg-secondary text-white rounded-lg hover:bg-secondary-dark"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }, [filterText, showFilterDropdown, tempRoleCategory, rolesData]);

  return (
    <>
      <DashboardPageTitle
        text="Users"
        button
        buttonText={
          <Link to={"/dashboard/users/add"} className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="inline-block me-4 text-white">Add New User</span>
          </Link>
        }
      />
      <div className="w-full">
        <DataTable
          columns={columns}
          data={studentsData?.data?.data?.users || []}
          highlightOnHover
          customStyles={customStyles}
          progressPending={isLoading}
          subHeader
          subHeaderComponent={subHeaderComponent}
          pagination
          paginationServer
          paginationTotalRows={studentsData?.data?.data?.pagination?.total || 0}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          paginationDefaultPage={currentPage}
          paginationPerPage={perPage}
          progressComponent={<CircleLoader />}
        />
      </div>
    </>
  );
};
export default StudentsPage;
