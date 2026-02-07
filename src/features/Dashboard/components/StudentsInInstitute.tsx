// StudentsInInstitute.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteStudent,
  getAllPrograms,
  getStudentsInInstitute,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import type { Student } from "@/features/Dashboard/types/dashboardTypes";
import AddNewStudentToInstitute from "./AddNewStudentToInstitute";
import AddBulkOfStudents from "./AddBulkOfStudents";
import DownloadExcelTemplate from "./DownloadExcelTemplate";
import ExportStudentsButton from "./ExportStudentExcel";

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
    selector: (row: Student) => (
      <img
        src={row?.image}
        alt={row?.name}
        className="w-12 h-12 rounded-full"
      />
    ),
    minWidth: "80px",
    style: { justifyContent: "center" },
  },
  {
    name: "Name",
    selector: (row: Student) => (
      <Link className="underline text-sm" to={`/dashboard/users/${row.id}`}>
        {row.name}
      </Link>
    ),
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Email",
    selector: (row: Student) => row?.email,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Phone",
    selector: (row: Student) => row?.phone,
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Program",
    selector: (row: Student) => row?.program?.name ?? "-",
    sortable: true,
    style: { justifyContent: "center" },
  },
  {
    name: "Edit",
    style: { justifyContent: "center" },
    cell: (row: Student) => (
      <Link to={`/edit-student/${row?.id}`} className="cursor-pointer">
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
    cell: (row: Student) => (
      <DeleteButton
        deleteApi={() => deleteStudent(row?.id)}
        successMessage="User Deleted Successfully!"
        errorMessage="Error while deleting student!"
        refetchFunction="getStudentsInInstitute"
      />
    ),
    ignoreRowClick: true,
    button: true,
    minWidth: "60px",
  },
];

const StudentsInInstitute = () => {
  const { instituteId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpenModal, setOpenModal] = useState(false);
  const [addBulkStudentsModal, setAddBulkStudentsModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all programs
  const { data: allProgramsInInstitute } = useQuery({
    queryKey: ["getAllPrograms"],
    queryFn: () => getAllPrograms(instituteId ?? ""),
  });
  // Get filter values from URL or use defaults
  const programId = searchParams.get("programId") || "2";
  const isActive = searchParams.get("isActive") || "1";

  // Temporary filter states (for editing before applying)
  const [tempProgramId, setTempProgramId] = useState(programId);
  const [tempIsActive, setTempIsActive] = useState(isActive);

  // Sync temp values when URL params change
  useEffect(() => {
    setTempProgramId(programId);
    setTempIsActive(isActive);
  }, [programId, isActive]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
        // Reset temp values to current URL params
        setTempProgramId(programId);
        setTempIsActive(isActive);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown, programId, isActive]);

  const { data, isLoading } = useQuery({
    queryKey: ["getStudentsInInstitute", instituteId, programId, isActive],
    queryFn: () =>
      getStudentsInInstitute(instituteId ?? "", programId, isActive),
    enabled: !!instituteId,
  });

  const filteredItems = useMemo(() => {
    if (!data?.data?.data) return [];
    return data?.data?.data?.filter((item: Student) =>
      item?.name?.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [filterText, data?.data?.data]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (tempProgramId) params.set("programId", tempProgramId);
    if (tempIsActive) params.set("isActive", tempIsActive);
    setSearchParams(params);
    setShowFilterDropdown(false);
  };

  const handleClearFilters = () => {
    setTempProgramId("");
    setTempIsActive("");
  };

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start md:items-center w-full">
        {/* Left side - Search and Filter */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
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

          {/* Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="border text-[#ACACAC] gap-1 flex items-center justify-center py-2 border-[#ACACAC] h-9 px-4 rounded-2xl text-sm whitespace-nowrap"
            >
              <FilterIcon />
              <span>Filter</span>
            </button>

            {showFilterDropdown && (
              <div className="fixed md:absolute top-auto md:top-full left-4 right-4 md:left-0 md:right-auto mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-auto md:w-64">
                <div className="space-y-3">
                  {/* Program Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program
                    </label>
                    <select
                      value={tempProgramId}
                      onChange={(e) => setTempProgramId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="">All Programs</option>
                      {allProgramsInInstitute?.data.map((program) => (
                        <option value={program?.id}>{program?.name}</option>
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
            )}
          </div>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center justify-center from-secondary to-secondary-dark text-white bg-gradient-to-r rounded-2xl h-9 px-4 whitespace-nowrap"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="ml-2">Add New Student</span>
          </button>

          <button
            onClick={() => setAddBulkStudentsModal(true)}
            className="bg-gradient-to-r justify-center from-[#FCB737] to-[#BB831A] py-0.5 text-white text-sm flex items-center gap-2 rounded-2xl h-9 px-4 whitespace-nowrap"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="ml-2">Add List Of Students</span>
          </button>
        </div>
      </div>
    );
  }, [filterText, showFilterDropdown, tempProgramId, tempIsActive]);

  return (
    <>
      <DashboardPageTitle text="Students" />

      <div className="w-full">
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
      <div className="flex gap-2 items-center mt-6">
        <DownloadExcelTemplate excelContent="Add Students" />
        <ExportStudentsButton />
      </div>

      <AddNewStudentToInstitute
        reviewModalOpen={isOpenModal}
        setReviewModalOpen={setOpenModal}
      />
      <AddBulkOfStudents
        setReviewModalOpen={setAddBulkStudentsModal}
        reviewModalOpen={addBulkStudentsModal}
      />
    </>
  );
};

export default StudentsInInstitute;
