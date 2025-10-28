import SectionTitle from "@/shared/components/SectionTitle";
import { useLanguage } from "@/shared/localization/useLanguage";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import { useQuery } from "@tanstack/react-query";
import { getContentRatings } from "@/features/CourseDetails/services/contentDetails";
import type { ContentRatingsType } from "@/shared/types/sharedTypes";
import { useParams } from "react-router-dom";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";

const ContentRatings = () => {
  const { t } = useLanguage();
  const { courseId } = useParams();

  const { data, isLoading, error } = useQuery<ContentRatingsType>({
    queryKey: ["getContentRatings", courseId],
    queryFn: () => getContentRatings(courseId!),
    enabled: !!courseId,
  });

  if (error) {
    return <SliderErrorFallback componentTitle={t("ratings")} />;
  }

  if (isLoading) {
    return (
      <>
        <SectionTitle textTitle={t("ratings")} />
        <div className="animate-pulse grid md:grid-cols-2 grid-cols-1 gap-10">
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </>
    );
  }

  const avg = data?.average ?? 0;
  const filledStars = Math.floor(avg);

  return (
    <>
      <SectionTitle textTitle={t("ratings")} />

      <div className="grid md:grid-cols-2 grid-cols-1 gap-10 items-start">
        {/* Histogram */}
        <div className="flex flex-col gap-3">
          {Object.entries(data?.histogram || {})
            .reverse() // 5 → 1
            .map(([rate, count]) => (
              <div key={rate} className="flex items-center gap-2">
                {/* Show 5.0, 4.0, ... */}
                <span className="w-8">{Number(rate).toFixed(1)}</span>

                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-amber-400 rounded"
                    style={{
                      width:
                        data!.totalRaters > 0
                          ? `${(count / data!.totalRaters) * 100}%`
                          : "0%",
                    }}
                  />
                </div>

                <span>{count}</span>
              </div>
            ))}
        </div>

        {/* Average + Total Raters */}
        <div className="flex flex-col justify-center items-center gap-2 bg-[#FFF7E6] rounded-md min-h-[150px] p-4">
          <div className="text-[#FCB737] font-bold text-3xl">
            {data?.average.toFixed(1)}
          </div>

          {/* Dynamic Stars */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon
                key={index}
                className={`h-7 w-7 ${
                  index < filledStars ? "text-[#FCB737]" : "text-gray-300"
                }`}
              />
            ))}
          </div>

          <p>
            <span>{data?.totalRaters}</span>
            <span className="inline-block mx-1">{t("rater")}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default ContentRatings;
