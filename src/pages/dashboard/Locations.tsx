import { useState, useMemo } from "react";
import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import {
  deleteCountry,
  deleteCity,
  deleteRegion,
  getAllCities,
  getAllCountries,
  getAllRegions,
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
import type { CountriesTypes } from "@/features/Dashboard/types/dashboardTypes";

/* ------------------ table styles ------------------ */
const customStyles = {
  rows: { style: { minHeight: "48px" } },
  subHeader: { style: { borderRadius: "12px 12px 0 0" } },
  pagination: { style: { borderRadius: "0 0 12px 12px" } },
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

/* ------------------ tabs config ------------------ */
const TABS = {
  countries: {
    label: "Countries",
    queryKey: "getAllCountries",
    queryFn: getAllCountries,
    addText: "Add New Country",
    link: "/dashboard/location/add-new-country",
    deleteFn: deleteCountry,
  },
  cities: {
    label: "Cities",
    queryKey: "getAllCities",
    queryFn: getAllCities,
    addText: "Add New City",
    link: "/dashboard/location/add-new-city",
    deleteFn: deleteCity,
  },
  regions: {
    label: "Regions",
    queryKey: "getAllRegions",
    queryFn: getAllRegions,
    addText: "Add New Region",
    link: "/dashboard/location/add-new-region",
    deleteFn: deleteRegion,
  },
};

const Locations = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof TABS>("countries");
  const [filterText, setFilterText] = useState("");

  const currentTab = TABS[activeTab];

  /* ------------------ fetch data ------------------ */
  const { data, isLoading } = useQuery({
    queryKey: [currentTab.queryKey],
    queryFn: currentTab.queryFn,
  });

  /* ------------------ filter ------------------ */
  const filteredItems = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((item: CountriesTypes) =>
      item.name?.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [data, filterText]);

  /* ------------------ columns (dynamic) ------------------ */
  const columns = useMemo(
    () => [
      {
        name: "Num",
        selector: (_: unknown, index: number) => index + 1,
        width: "60px",
        style: { justifyContent: "center" },
      },
      {
        name: "Name",
        selector: (row: CountriesTypes) => row?.name,
        sortable: true,
        style: { justifyContent: "center" },
      },
      {
        name: "Created At",
        selector: (row: CountriesTypes) => row?.createdAt,
        sortable: true,
        style: { justifyContent: "center" },
      },
      {
        name: "Created By",
        selector: (row: CountriesTypes) => row?.createdBy?.name,
        sortable: true,
        style: { justifyContent: "center" },
      },
      {
        name: "Edit",
        cell: (row: CountriesTypes) => (
          <Link to={`/dashboard/location/${activeTab}/${row.id}`}>
            <EditIcon />
          </Link>
        ),
        button: true,
      },
      {
        name: "Delete",
        cell: (row: CountriesTypes) => (
          <DeleteButton
            deleteApi={() => currentTab.deleteFn(row.id)}
            successMessage={`${currentTab.label} deleted successfully`}
            errorMessage="حدث خطأ أثناء الحذف"
            refetchFunction={currentTab.queryKey}
          />
        ),
        button: true,
      },
    ],
    [currentTab, activeTab],
  );

  /* ------------------ search header ------------------ */
  const subHeaderComponent = (
    <div className="flex gap-2 max-md:w-full max-md:justify-center">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name"
          className="border border-[#ACACAC] h-9 px-10 rounded-2xl text-sm"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <span className="absolute start-2 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </span>
      </div>

      <div className="border border-[#ACACAC] h-9 px-4 rounded-2xl flex items-center gap-1 text-sm text-gray-500">
        <FilterIcon />
        Filter
      </div>
    </div>
  );

  return (
    <>
      {/* Page Title */}
      <DashboardPageTitle
        text="Locations"
        button
        buttonText={
          <Link to={currentTab.link} className="center">
            <PlusIcon className="mt-1.5 h-8 -ms-2" />
            <span className="text-white">{currentTab.addText}</span>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as keyof typeof TABS)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === key
                ? "bg-secondary text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        customStyles={customStyles}
        highlightOnHover
        pagination
        progressPending={isLoading}
        progressComponent={<CircleLoader />}
        subHeader
        subHeaderComponent={subHeaderComponent}
      />
    </>
  );
};

export default Locations;
