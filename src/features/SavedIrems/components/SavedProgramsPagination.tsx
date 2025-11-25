import type { ProgramsResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useSearchParams } from "react-router-dom";
import { RESULTS_PER_PAGE } from "@/shared/utils/globals";
import { Suspense, lazy } from "react";
import { getSavedPrograms } from "../services/savedApis";
import EmptyData from "@/shared/components/ui/EmptyData";

const ProgramsSectionCardSkeleton = lazy(
  () => import("@/shared/components/ui/ProgramsSectionCardSkeleton")
);
const ProgramsSectionCard = lazy(
  () => import("@/shared/components/EduGap/ProgramsSectionCard")
);

const SavedProgramsPagination = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useQuery<ProgramsResponse>({
    queryKey: ["getGuestProgramsList", page],
    queryFn: () => getSavedPrograms(page.toString(), RESULTS_PER_PAGE),
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <>
      <>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {Array.from({ length: 2 }).map((_, idx) => (
                <ProgramsSectionCardSkeleton key={idx} />
              ))}
            </div>
          }
        >
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 2 }).map((_, idx) => (
                <ProgramsSectionCardSkeleton key={idx} />
              ))}
            </div>
          ) : data?.items?.length === 0 ? (
            <EmptyData messageToShow={t("no_data_available")} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data?.items?.map((d, index) => (
                  <ProgramsSectionCard key={index} data={d} />
                ))}
              </div>
              <CustomPagination
                currentPage={data?.pagination?.page ?? 1}
                onPageChange={handlePageChange}
                totalPages={data?.pagination?.totalPages ?? 1}
              />
            </>
          )}
        </Suspense>
      </>
    </>
  );
};

export default SavedProgramsPagination;
