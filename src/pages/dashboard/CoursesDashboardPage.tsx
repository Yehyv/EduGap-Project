import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  courseActiveToggle,
  deleteCourse,
  getCoursesForDashboard,
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
import type { CoursesForDashboard } from "@/features/Dashboard/types/dashboardTypes";
import ActiveStatusButton from "@/features/Dashboard/components/ActiveStatusButton";
import { useLanguage } from "@/shared/localization/useLanguage";

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

const CoursesDashboardPage = () => {
  const { t } = useLanguage();

  const columns = [
    {
      name: t("num"),
      selector: (_, index: number) => index + 1,
      sortable: false,
      width: "60px",
      style: { justifyContent: "center" },
    },
    {
      name: t("logo"),
      selector: (row: CoursesForDashboard) => (
        <img
          src={row.image}
          alt={row.name}
          className="w-12 h-12 rounded-full"
        />
      ),
      sortable: false,
      minWidth: "80px",
      style: { justifyContent: "center" },
    },
    {
      name: t("name"),
      selector: (row: CoursesForDashboard) => (
        <Link className="underline text-sm" to={`/dashboard/courses/${row.id}`}>
          {row?.name}
        </Link>
      ),
      sortable: true,
      style: { justifyContent: "center" },
    },
    {
      name: t("createdAt"),
      selector: (row: CoursesForDashboard) => row?.createdAt,
      sortable: true,
      style: { justifyContent: "center" },
    },

    {
      name: t("isActive"),
      style: { justifyContent: "center" },
      cell: (row: CoursesForDashboard) => {
        const isActive = row?.isActive;
        return (
          <ActiveStatusButton
            itemId={row?.id}
            activateApi={courseActiveToggle}
            deactivateApi={courseActiveToggle}
            isActive={+isActive ?? false}
            refetchKey={"getCoursesForDashboard"}
            showModal={false}
          />
        );
      },
      sortable: true,
    },
    {
      name: t("edit"),
      style: { justifyContent: "center" },
      cell: (row: CoursesForDashboard) => (
        <Link
          to={`/dashboard/courses/edit/${row?.id}`}
          className="cursor-pointer"
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
      name: t("delete"),
      style: { justifyContent: "center" },
      cell: (row: CoursesForDashboard) => (
        <DeleteButton
          deleteApi={() => deleteCourse(row.id)}
          successMessage={t("courseDeletedSuccessfully")}
          errorMessage={t("errorOccurredDuringDeletion")}
          refetchFunction="getCoursesForDashboard"
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "60px",
    },
  ];

  const { data: InstitutesData, isLoading } = useQuery({
    queryKey: ["getCoursesForDashboard"],
    queryFn: () => getCoursesForDashboard(),
  });

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    if (!InstitutesData?.data) return [];
    return InstitutesData.data.filter((item: CoursesForDashboard) =>
      item?.name?.toLowerCase().includes(filterText?.toLowerCase()),
    );
  }, [filterText, InstitutesData]);

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="flex gap-2 max-md:justify-center max-md:w-full">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder={t("searchByName")}
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
          <span>{t("filter")}</span>
        </div>
      </div>
    );
  }, [filterText, t]);

  return (
    <>
      <DashboardPageTitle
        text={t("courses")}
        button
        buttonText={
          <Link to={"/dashboard/courses/add"} className="center">
            <PlusIcon className="mt-1.5 h-8" />
            <span className="inline-block me-4 text-white">
              {t("addNewCourse")}
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
          pa
          progressComponent={<CircleLoader />}
        />
      </div>
    </>
  );
};
export default CoursesDashboardPage;
