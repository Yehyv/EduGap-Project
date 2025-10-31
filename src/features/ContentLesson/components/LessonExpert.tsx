import ExpertIcon from "@/assets/svgs/ExpertIcon.svg?react";
import UserImage from "@/assets/svgs/UserIcon.svg";
import StarYellowIcon from "@/assets/svgs/StarIcon.svg?react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { getContentEducator } from "../services/lessonsApis";
import type { ContentEducatorType } from "@/shared/types/sharedTypes";

const LessonExpert = () => {
  const { t } = useLanguage();
  const { courseId } = useParams();

  const { data, isLoading, error } = useQuery<ContentEducatorType>({
    queryKey: ["getContentEducator", courseId],
    queryFn: () => getContentEducator(courseId!),
    enabled: !!courseId,
  });

  const educator = data?.educator;

  return (
    <div className="shadow-custom overflow-auto top-16 rounded-xl py-5">
      <h5 className="flex gap-2 text-lg font-semibold mb-4 border-b pb-3 border-[#D0CDCD] px-5">
        <ExpertIcon className="w-5 h-5" />
        <span>{t("expert")}</span>
      </h5>

      <section className="px-6 my-2 text-center">
        {isLoading && (
          <p className="text-gray-400 text-sm">{t("loading_expert")}</p>
        )}

        {error && (
          <p className="text-red-500 text-sm">{t("error_loading_expert")}</p>
        )}

        {!isLoading && !error && !educator && (
          <p className="text-gray-400 text-sm">{t("no_expert_available")}</p>
        )}

        {educator && (
          <>
            <div className="w-full flex gap-2 items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={educator.image || UserImage}
                  className="w-full h-full object-cover"
                  alt="expert"
                />
              </div>

              <div className="text-start w-full">
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-base">{educator.name}</h5>

                  <div className="flex items-center gap-1 text-[#FABC03]">
                    <StarYellowIcon className="w-4 h-4" />
                    <span className="text-sm">{educator.rate}</span>
                  </div>
                </div>

                <h6 className="text-[#939393] text-sm mt-0.5">
                  {educator.title}
                </h6>
              </div>
            </div>

            <Link
              className="border inline-block mt-4 border-secondary px-6 rounded-lg py-1 text-secondary text-sm"
              to={`/expert/${educator.id}`}
            >
              {t("more_about_expert")}
            </Link>
          </>
        )}
      </section>
    </div>
  );
};

export default LessonExpert;
