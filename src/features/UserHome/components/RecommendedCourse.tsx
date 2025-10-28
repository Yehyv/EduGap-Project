import { useEffect, useState } from "react";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import SaveIcon from "@/assets/svgs/SaveIconWhite.svg?react";
import userIcon from "@/assets/svgs/userIcon.svg";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/features/auth/context/UserContext";
import { getRecommenedCourse } from "../services/userHomeApis";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useNavigate } from "react-router-dom";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";

const RecommendedCourse = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const { user } = useUser();

  const { data, isLoading, error } = useQuery<CourseType>({
    queryKey: ["getCoursesList", user?.programId],
    queryFn: () => getRecommenedCourse(user?.programId),
    enabled: !!user?.programId,
  });

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container my-5 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-[#F1F1F1] rounded-2xl overflow-hidden">
          {/* Video Skeleton */}
          <div className="md:col-span-3 h-[350px] bg-gray-200" />
          {/* Content Skeleton */}
          <div className="md:col-span-2 px-6 py-6 space-y-4">
            <div className="h-6 bg-gray-200 w-3/4 rounded"></div>
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex flex-col gap-2 w-1/2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded w-32 mx-auto mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <SliderErrorFallback componentTitle="Recommended Course" />;
  }
  return (
    <div className="container my-5">
      <div
        className={`grid grid-cols-1 md:grid-cols-5 gap-4 bg-[#F1F1F1] rounded-2xl overflow-hidden`}
      >
        {/* Video Section */}
        <div
          className={` relative w-full min-h-[300px] md:min-h-[350px] md:col-span-3`}
        >
          {!isOnline ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-red-500">
              ⚠️ No internet connection
            </div>
          ) : videoError ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-600 text-white font-bold">
              ❌ Video failed to load
            </div>
          ) : (
            <video
              className="w-full h-full object-cover shadow"
              controls
              onError={() => setVideoError(true)}
            >
              <source src={data?.ad_video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Content Section */}
        <div className="md:col-span-2 px-6 py-6 flex flex-col">
          <div className="flex justify-between">
            <h3 className="text-2xl md:text-2xl font-bold text-gray-800 mb-3">
              {data?.name}
            </h3>
            <div className="w-7 h-7 p-1 bg-white rounded-full grid items-center justify-center cursor-pointer">
              <SaveIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="flex gap-4 items-center my-5">
            <img src={userIcon} className="w-10 h-10 rounded-full" />
            <div>
              <h5 className="font-semibold">{data?.educator.name}</h5>
              <h6 className="text-[#575757]">{data?.educator.title}</h6>
            </div>
          </div>

          <p
            className="text-gray-600 mb-5 line-clamp-3"
            title={data?.description}
          >
            {data?.description}
          </p>

          <div className="mt-auto mb-7 mx-auto">
            <DefaultButton
              text={t("course_details")}
              onClick={() => navigate("/")}
              type="button"
              moreStyle="px-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedCourse;
