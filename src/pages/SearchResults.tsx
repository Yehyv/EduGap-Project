import SectionTitle from "@/shared/components/SectionTitle";
import CourseCard from "@/shared/components/EduGap/CourseCard";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CardSkeleton from "@/shared/components/ui/CardSkeleton";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useSearchParams } from "react-router-dom";

import { useSearch } from "@/shared/hooks/useSearch";
import LoaderAnimationComponent from "@/shared/components/ui/LoaderAnimationComponent";
import NotFoundSearchComponent from "@/shared/components/ui/NotFoundSearchComponent";

const SearchResults = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("query") || "";
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useSearch(keyword, page);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ query: keyword, page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <div className="mb-5 mt-10 container">
      <ScrollToTop />
      <SectionTitle textTitle={t("search_results")} />

      {/*  Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/*  Empty state */}
          {!data?.items?.length ? (
            <div className="flex flex-col items-center justify-center text-center mb-20">
              <NotFoundSearchComponent className="h-60 mt-0" />
              <h2 className="text-xl -mt-4 font-semibold text-gray-700">
                {t("no_results_found")}
              </h2>
              <p className="text-gray-500 mt-2">{t("try_different_keyword")}</p>
            </div>
          ) : (
            <>
              {/*  Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 my-6">
                {data.items.map((courseData, idx) => (
                  <CourseCard key={idx} course={courseData} />
                ))}
              </div>

              {/*  Pagination Only if more than 1 page */}
              {data?.items?.length > 0 && (
                <CustomPagination
                  currentPage={data?.pagination?.page ?? 1}
                  onPageChange={handlePageChange}
                  totalPages={data?.pagination?.totalPages ?? 1}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
