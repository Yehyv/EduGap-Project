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
import { useLanguage } from "@/shared/localization/useLanguage";

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
    label: "countries",
    queryKey: "getAllCountries",
    queryFn: getAllCountries,
    addText: "add_new_country",
    link: "/dashboard/location/add-new-country",
    deleteFn: deleteCountry,
  },
  cities: {
    label: "cities",
    queryKey: "getAllCities",
    queryFn: getAllCities,
    addText: "add_new_city",
    link: "/dashboard/location/add-new-city",
    deleteFn: deleteCity,
  },
  regions: {
    label: "regions",
    queryKey: "getAllRegions",
    queryFn: getAllRegions,
    addText: "add_new_region",
    link: "/dashboard/location/add-new-region",
    deleteFn: deleteRegion,
  },
};

const Locations = () => {
  const { t } = useLanguage();

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
        name: t("num"),
        selector: (_: unknown, index: number) => index + 1,
        width: "60px",
        style: { justifyContent: "center" },
      },
      {
        name: t("name"),
        selector: (row: CountriesTypes) => row?.name,
        sortable: true,
        style: { justifyContent: "center" },
      },
      {
        name: t("created_at"),
        selector: (row: CountriesTypes) => row?.createdAt,
        sortable: true,
        style: { justifyContent: "center" },
      },
      {
        name: t("created_by"),
        selector: (row: CountriesTypes) => row?.createdBy?.name,
        sortable: true,
        style: { justifyContent: "center" },
      },
      {
        name: t("edit"),
        cell: (row: CountriesTypes) => (
          <Link to={`/dashboard/location/${activeTab}/${row.id}`}>
            <EditIcon />
          </Link>
        ),
        button: true,
      },
      {
        name: t("delete"),
        cell: (row: CountriesTypes) => (
          <DeleteButton
            deleteApi={() => currentTab.deleteFn(row.id)}
            successMessage={`${t(currentTab.label)} ${t(
              "deleted_successfully",
            )}`}
            errorMessage={t("error_occurred_while_deleting")}
            refetchFunction={currentTab.queryKey}
          />
        ),
        button: true,
      },
    ],
    [currentTab, activeTab, t],
  );

  /* ------------------ search header ------------------ */
  const subHeaderComponent = (
    <div className="flex gap-2 max-md:w-full max-md:justify-center">
      <div className="relative">
        <input
          type="text"
          placeholder={t("search_by_name")}
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
        {t("filter")}
      </div>
    </div>
  );

  return (
    <>
      {/* Page Title */}
      <DashboardPageTitle
        text={t("locations")}
        button
        buttonText={
          <Link to={currentTab.link} className="center">
            <PlusIcon className="mt-1.5 h-8 -ms-2" />

            <span className="text-white">{t(currentTab.addText)}</span>
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
            {t(tab.label)}
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
