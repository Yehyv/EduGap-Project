import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteRole,
  getAllRoles,
} from "@/features/Dashboard/services/dashboardApis";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import SearchIcon from "@/assets/svgs/SearchIconDashboard.svg?react";
import FilterIcon from "@/assets/svgs/FilterIcon.svg?react";
import PlusIcon from "@/assets/svgs/PlusIcon.svg?react";
import { Link } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import type { RolesList as RoleType } from "@/features/Dashboard/types/dashboardTypes";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";

/* ------------------ styles ------------------ */
const customStyles = {
  rows: { style: { minHeight: "48px" } },
  subHeader: { style: { borderRadius: "12px 12px 0px 0px" } },
  pagination: { style: { borderRadius: "0px 0px 12px 12px" } },
  headCells: {
    style: {
      fontSize: "14px",
      fontWeight: "700",
      justifyContent: "center",
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      textAlign: "center",
    },
  },
};

/* ------------------ columns ------------------ */
const columns = [
  {
    name: "Num",
    selector: (_: unknown, index: number) => index + 1,
    width: "60px",
    center: true,
  },
  {
    name: "Title",
    selector: (row: RoleType) => row.role_title,
    sortable: true,
    center: true,
  },
  {
    name: "Created At",
    selector: (row: RoleType) => row.created_at,
    sortable: true,
    center: true,
  },
  {
    name: "Updated At",
    selector: (row: RoleType) => row.updated_at,
    sortable: true,
    center: true,
  },
  {
    name: "Edit",
    cell: (row: RoleType) => (
      <Link to={`/dashboard/roles/edit-role/${row.id}`}>
        <EditIcon />
      </Link>
    ),
    button: true,
    center: true,
  },
  {
    name: "Delete",
    style: { justifyContent: "center" },
    cell: (row: RoleType) => (
      <DeleteButton
        deleteApi={() => deleteRole(row.id)}
        successMessage="تم حذف الصلاحية بنجاح"
        errorMessage="حدث خطأ أثناء الحذف"
        refetchFunction="getRolesList"
      />
    ),
    ignoreRowClick: true,
    button: true,
    minWidth: "60px",
  },
];

const RolesList = () => {
  /* ------------------ pagination state ------------------ */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterText, setFilterText] = useState("");

  /* ------------------ query ------------------ */
  const { data, isLoading } = useQuery({
    queryKey: ["getRolesList", page, limit],
    queryFn: () => getAllRoles(page, limit),
    keepPreviousData: true,
  });

  /* ------------------ filtering ------------------ */
  const filteredItems = useMemo(() => {
    if (!data?.data?.items) return [];
    return data.data.items.filter((item: RoleType) =>
      item.role_title?.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [data, filterText]);

  /* ------------------ sub header ------------------ */
  const subHeaderComponent = (
    <div className="flex gap-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by title"
          className="border border-[#ACACAC] h-9 px-10 rounded-2xl text-sm"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <span className="absolute start-2 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </span>
      </div>

      <div className="border border-[#ACACAC] h-9 px-4 rounded-2xl flex items-center gap-1 text-sm">
        <FilterIcon />
        Filter
      </div>
    </div>
  );

  /* ------------------ handlers ------------------ */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <>
      <DashboardPageTitle
        text="Roles"
        button
        buttonText={
          <Link to="/dashboard/roles/add-new-role" className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="me-4 text-white">Add New Role</span>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        highlightOnHover
        progressPending={isLoading}
        progressComponent={<CircleLoader />}
        pagination
        paginationServer
        paginationTotalRows={data?.data?.pagination?.total ?? 0}
        paginationPerPage={limit}
        paginationDefaultPage={page}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
        subHeader
        subHeaderComponent={subHeaderComponent}
      />
    </>
  );
};

export default RolesList;
