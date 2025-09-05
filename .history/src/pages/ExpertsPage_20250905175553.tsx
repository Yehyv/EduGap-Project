import SectionTitle from "../SectionTitle";
import Slider from "react-slick";
import ArrowButton from "../ui/ArrowButton";
import GhostButton from "../ui/GhostButton";
import ExpertsCard from "./ExpertsCard";
import { useQuery } from "@tanstack/react-query";
import { getExpertsForSlider } from "@/shared/services/sharedApis";
import type { ExpertsData } from "@/shared/types/sharedTypes";
import ExpertSkeleton from "../ui/ExpertSkeleton";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";

const ExpertsPage = () => {
  const { data, isLoading, error } = useQuery<ExpertsData[]>({
    queryKey: ["getExpertsList"],
    queryFn: getExpertsForSlider,
  });

  if (error) return <SliderErrorFallback componentTitle="الخبراء" />;
  return (
    <div className="container mb-20">
      <div className="flex justify-between items-start">
        <SectionTitle textTitle="الخبراء" lineWidth="w-22" />
        <GhostButton buttonText="المزيد" to="experts-list" />
      </div>

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
