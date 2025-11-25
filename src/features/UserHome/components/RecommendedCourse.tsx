import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import userIcon from "@/assets/svgs/userIcon.svg";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/features/auth/context/UserContext";
import { getRecommenedCourse } from "../services/userHomeApis";
import type { CourseType } from "@/shared/types/sharedTypes";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useNavigate } from "react-router-dom";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import { saveContent } from "@/features/CourseDetails/services/contentDetails";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import SaveButton from "@/features/SavedIrems/components/SaveButton";
const RecommendedCourse = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useUser();

  const { data, isLoading, error } = useQuery<CourseType>({
    queryKey: ["getRecommenedCourse", user?.programId],
    queryFn: () => getRecommenedCourse(user?.programId),
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
            <div className="h-10 bg-gray-300 rounded w-32 mx-auto mt-24"></div>
          </div>
          {/* Video Skeleton */}
          <div className="md:col-span-3 h-[350px] bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return <SliderErrorFallback componentTitle="Recommended Course" />;
  }
  return (
    <div
      className="container my-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-[#F1F1F1] rounded-2xl overflow-hidden">
        {/* Content Section */}
        <motion.div
          className="md:col-span-2 px-6 py-6 flex flex-col max-md:order-1"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <div className="">
            <h3 className="text-2xl md:text-2xl font-bold text-gray-800 mb-3">
              <span>{data?.name}</span>
              <span className="bg-[#FFEDB5] text-sm inline-block mx-2 text-[#FFAA00] rounded-3xl py-0.5 px-4">
                {t("new")}
              </span>
            </h3>
          </div>

          {data?.educator && (
            <motion.div
              className="flex gap-4 items-center my-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <img
                src={data?.educator?.image ?? userIcon}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h5 className="font-semibold">{data?.educator?.name ?? ""}</h5>
                <h6 className="text-[#575757]">{data?.educator?.title}</h6>
              </div>
            </motion.div>
          )}

          <motion.p
            className="text-gray-600 mb-5 line-clamp-3"
            title={data?.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {data?.description}
          </motion.p>

          <motion.div
            className="mt-auto w-full center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <DefaultButton
                text={t("course_details")}
                onClick={() => navigate(`/user-course-details/${data?.id}`)}
                type="button"
                moreStyle="lg:px-10"
              />
            </motion.div>

            <SaveButton
              id={data?.id ?? 0}
              isSaved={data?.isSaved ?? false}
              messageForUnSaved={t("conent_unsaved")}
              messageForSaved={t("content_saved_successfully")}
              saveFunction={saveContent}
              invalidateQueriesKeys={[
                { queryKey: ["getRecommenedCourse", user?.programId] },
              ]}
            />
          </motion.div>
        </motion.div>
        {/* Video Section */}
        <div className="relative w-full min-h-[300px] md:min-h-[300px] md:col-span-3">
          <CourseVideo
            videoHeight="md:h-[350px]"
            isThisLessonAlreadyCompleted={true}
            isOnline={isOnline}
            videoUrl={data?.ad_video ?? ""}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendedCourse;
