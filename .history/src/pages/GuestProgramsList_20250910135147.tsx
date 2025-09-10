import SectionTitle from "@/shared/components/SectionTitle";
import type { CoursesResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { getAllGuestPopularCourses } from "@/features/GuestHome/services/GuestHomeApi";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useSearchParams } from "react-router-dom";
import ProgramsSectionCardSkeleton from "@/shared/components/ui/ProgramsSectionCardSkeleton";
import ProgramsSectionCard from "@/shared/components/EduGap/ProgramsSectionCard";

const GuestPopularCoursesPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading, error } = useQuery<CoursesResponse>({
    queryKey: ["getGuestProgramsList", page],
    queryFn: () => getAllGuestPopularCourses(page.toString(), "3"),
  });
  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <div className="mb-5 mt-10 container">
      <ScrollToTop />
      <SectionTitle textTitle={t("programs_title")} />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <ProgramsSectionCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data?.map((d, index) => (
              <ProgramsSectionCard key={index} data={d} />
            ))}
          </div>
          <CustomPagination
            currentPage={data?.pagination.page ?? 1}
            onPageChange={handlePageChange}
            totalPages={data?.pagination.totalPages ?? 1}
          />
        </>
      )}
    </div>
  );
};

export default GuestPopularCoursesPage;
