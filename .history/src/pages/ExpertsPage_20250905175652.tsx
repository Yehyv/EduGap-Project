import SectionTitle from "@/shared/components/SectionTitle";
import ExpertsCard from "@/shared/components/EduGap/ExpertsCard";
import { useQuery } from "@tanstack/react-query";
import { getExpertsForSlider } from "@/shared/services/sharedApis";
import type { ExpertsData } from "@/shared/types/sharedTypes";
import ExpertSkeleton from "@/shared/components/ui/ExpertSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";

const ExpertsPage = () => {
  const { data, isLoading, error } = useQuery<ExpertsData[]>({
    queryKey: ["getExpertsList"],
    queryFn: getExpertsForSlider,
  });

  if (error) return <SliderErrorFallback componentTitle="الخبراء" />;
  return (
    <div className="container mb-20">
      <SectionTitle textTitle="الخبراء" lineWidth="w-22" />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ExpertSkeleton key={i} />
          ))}
        </div>
      ) : (
        data?.map((expertData, index) => (
          <ExpertsCard key={index} expertData={expertData} />
        ))
      )}
    </div>
  );
};

export default ExpertsPage;
