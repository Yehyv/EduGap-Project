import SectionTitle from "@/shared/components/SectionTitle";
import ExpertsCard from "@/shared/components/EduGap/ExpertsCard";
import { useQuery } from "@tanstack/react-query";
import type { ExpertsResponse } from "@/shared/types/sharedTypes";
import ExpertSkeleton from "@/shared/components/ui/ExpertSkeleton";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CustomPagination from "@/shared/utils/CustomPagination";
import { getAllExpertsList } from "@/features/GuestHome/services/GuestHomeApi";
import { RESULTS_PER_PAGE } from "@/shared/utils/globals";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";

const ExpertsPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading, error } = useQuery<ExpertsResponse>({
    queryKey: ["guestExpertsList"],
    queryFn: () => getAllExpertsList(page.toString(), RESULTS_PER_PAGE),
  });
  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error.message} />;
  return (
    <div className="container my-10">
      <SectionTitle textTitle={t("experts")} lineWidth="w-22" />
      <ScrollToTop />
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-items-center xl:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ExpertSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {data?.items?.map((expertData, index) => (
            <ExpertsCard key={index} expertData={expertData} />
          ))}
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

export default ExpertsPage;
