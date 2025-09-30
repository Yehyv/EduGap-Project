import SectionTitle from "@/shared/components/SectionTitle";
import type { ProgramsResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/shared/components/ErrorMessage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import CustomPagination from "@/shared/utils/CustomPagination";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useSearchParams } from "react-router-dom";
import ProgramsSectionCardSkeleton from "@/shared/components/ui/ProgramsSectionCardSkeleton";
import ProgramsSectionCard from "@/shared/components/EduGap/ProgramsSectionCard";
import { RESULTS_PER_PAGE } from "@/shared/utils/globals";
import { getAllEducationsList } from "@/features/GuestHome/services/GuestHomeApi";

const GuestPopularCoursesPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useQuery<ProgramsResponse>({
    queryKey: ["getGuestProgramsList", page],
    queryFn: () => getAllEducationsList(page.toString(), RESULTS_PER_PAGE),
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <div className="mb-5 mt-10 container">
      <ScrollToTop />
      <SectionTitle textTitle={t("programs_title")} />
      <div className="bg-primary">
        <h4>{t("programs_title")}</h4>
        <h4>اكتشف برامج التعلم المصممة لتطوير مهاراتك المهنية</h4>
        <p>
          رحلتك نحو التميز تبدأ من هنا! استكشف برامج التعلم المصممة خصيصًا لك،
          واختر التخصص اللي يناسب طموحك، وتعلم على طريقتك.
        </p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <ProgramsSectionCardSkeleton key={idx} />
          ))}
        </div>
      ) : data?.formattedPrograms?.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-500 text-lg font-medium">
            {t("no_data_available") ?? "لا يوجد بيانات متاحة"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.formattedPrograms?.map((d, index) => (
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
