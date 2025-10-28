import { getContentTopics } from "@/features/CourseDetails/services/contentDetails";
import SectionTitle from "@/shared/components/SectionTitle";
import FAQList from "@/shared/components/ui/FAQList";
import { useLanguage } from "@/shared/localization/useLanguage";
import type { ContentTopicsType } from "@/shared/types/sharedTypes";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const CourseContent = () => {
  const { t } = useLanguage();
  const { courseId } = useParams();
  const { data, isLoading, error } = useQuery<ContentTopicsType[]>({
    queryKey: ["getContentDetailsForEnrolledUsers", courseId],
    queryFn: () => getContentTopics(courseId!),
    enabled: !!courseId,
  });

  if (error) {
    return <SliderErrorFallback componentTitle="Content Topics" />;
  }

  return (
    <section className="py-5 my-6">
      <SectionTitle textTitle={t("course_content")} />

      {isLoading && (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-300 rounded"></div>
          ))}
        </div>
      )}

      {error && <SliderErrorFallback componentTitle="Content Topics" />}

      {data && <FAQList topics={data} />}
    </section>
  );
};

export default CourseContent;
