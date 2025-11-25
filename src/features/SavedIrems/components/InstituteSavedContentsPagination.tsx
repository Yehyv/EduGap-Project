import type { InstituteCoursesResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/shared/components/ErrorMessage";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useSearchParams } from "react-router-dom";
import { RESULTS_PER_PAGE } from "@/shared/utils/globals";
import InstituteCourseCard from "@/features/UserHome/components/InstituteCourseCard";
import { getInstituteSubjects } from "../services/savedApis";
import EmptyData from "@/shared/components/ui/EmptyData";
import { useLanguage } from "@/shared/localization/useLanguage";

const InstituteSavedContentsPagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useQuery<InstituteCoursesResponse>({
    queryKey: ["getInstituteSavedContents", page],
    queryFn: () => getInstituteSubjects(page.toString(), RESULTS_PER_PAGE),
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <EmptyData messageToShow={t("no_data_available")} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
            {data?.data?.map((courseData, idx) => (
              <InstituteCourseCard key={idx} course={courseData} />
            ))}
          </div>

          <CustomPagination
            currentPage={data?.pagination?.page ?? 1}
            onPageChange={handlePageChange}
            totalPages={data?.pagination?.totalPages ?? 1}
          />
        </>
      )}
    </>
  );
};

export default InstituteSavedContentsPagination;
