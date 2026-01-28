import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteStudent,
  getStudentsInInstitute,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
import { Link, useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import type { Student } from "@/features/Dashboard/types/dashboardTypes";
import AddNewStudentToInstitute from "./AddNewStudentToInstitute";

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
      <Link className="underline text-sm" to={`/student-details/${row.id}`}>
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
  const [isOpenModal, setOpenModal] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["getStudentsInInstitute"],
    queryFn: () => getStudentsInInstitute(instituteId ?? ""),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!data?.data?.data) return [];
    return data?.data?.data?.filter((item: Student) =>
      item?.name?.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [filterText, data?.data?.data]);

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
        <button
          onClick={() => setOpenModal(true)}
          className="center from-secondary to-secondary-dark text-white bg-gradient-to-r rounded-2xl"
        >
          <PlusIcon className="mt-1.5 h-8" />
          <span className="inline-block me-4 text-white">Add New Student</span>
        </button>
      </div>
    );
  }, [filterText]);

  return (
    <>
      <DashboardPageTitle text="Students" />

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
      <AddNewStudentToInstitute
        reviewModalOpen={isOpenModal}
        setReviewModalOpen={setOpenModal}
      />
    </>
  );
};

export default StudentsInInstitute;
