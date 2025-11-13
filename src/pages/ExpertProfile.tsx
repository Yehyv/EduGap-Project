import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import EyeIcon from "@/assets/svgs/EyeIcon.svg?react";
import PlayVideoIcon from "@/assets/svgs/PlayVideoIcon.svg?react";
import StudentsIcon from "@/assets/svgs/StudentsIcon.svg?react";
import { Loader } from "@/shared/components";
import ExpandableText from "@/shared/components/ui/ExpandableText";
import ExpertCourses from "@/shared/components/EduGap/ExpertCourses";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getExpertInfo } from "@/features/CourseDetails/services/contentDetails";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { useLanguage } from "@/shared/localization/useLanguage";

const ExpertProfile = () => {
  const { expertId } = useParams();
  const { t } = useLanguage();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getExpertInformation", expertId],
    queryFn: () => getExpertInfo(expertId ?? ""),
    enabled: !!expertId,
  });

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <ErrorMessage
        message={error.message ?? t("error_fetching_expert_data")}
      />
    );

  return (
    <div className="container my-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image & Rating */}
        <div className="w-40 md:w-48  flex flex-col items-center md:items-start">
          <div className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-lg overflow-hidden bg-gray-100 shadow-md">
            <img
              src={data?.image}
              alt={t("expert_profile_image")}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="flex items-center justify-center w-full gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className="w-5 h-5 text-yellow-400 inline-block"
              />
            ))}
            <span className="text-yellow-500 font-medium inline-block">
              5.0
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex w-full flex-col justify-between flex-1">
          {/* Top Info */}
          <div>
            <h4 className="w-fit border-t-2 border-[#FCB737] pt-3 text-xl font-bold">
              {data?.user?.full_name}
            </h4>
            <p className="text-[#575757] text-sm mb-4">{data?.title}</p>
            <div className="mb-4">
              <ExpandableText limit={2} text={data?.bio ?? ""} />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#F1EFEF] flex flex-col sm:flex-row justify-between text-base px-4 py-2 rounded-lg shadow-sm gap-4 mt-auto">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-6 h-6" />
              <span>{t("expert_views")}: 0</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayVideoIcon className="w-6 h-6" />
              <span>{t("expert_courses")}: 0</span>
            </div>
            <div className="flex items-center gap-2">
              <StudentsIcon className="w-6 h-6" />
              <span>{t("expert_students")}: 0</span>
            </div>
          </div>
        </div>
      </div>
      <ExpertCourses />
    </div>
  );
};

export default ExpertProfile;
