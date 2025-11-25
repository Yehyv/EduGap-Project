import { motion } from "framer-motion";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
// import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import DefaultButton from "../ui/DefaultButton";
import type { CourseType, NextLessonType } from "@/shared/types/sharedTypes";
import CourseCardOverlayDetails from "./CourseCardOverlayDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import LevelBadge from "../ui/LevelBadge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getNextLesson,
  saveContent,
} from "@/features/CourseDetails/services/contentDetails";
import ButtonLoader from "../ButtonLoader";
import SaveButton from "@/features/SavedIrems/components/SaveButton";
import { useUser } from "@/features/auth/context/UserContext";

const CourseCard = ({ course }: { course: CourseType }) => {
  const { t } = useLanguage();
  const { user } = useUser();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token") ? true : false;
  const { refetch: fetchNextLesson, isFetching: isFetchingNext } =
    useQuery<NextLessonType>({
      queryKey: ["getNextLesson", course?.id],
      queryFn: () => getNextLesson(course?.id!.toString() ?? ""),
      enabled: false,
    });

  const handleOpenCourse = async () => {
    if (!isLoggedIn) {
      navigate(`/guest-course-details/${course.id}`);
      return;
    }

    const { data } = await fetchNextLesson();

    const nextLessonId = data?.lessonId;

    navigate(`/course-lesson/${course.id}/${nextLessonId}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white rounded-xl shadow-custom overflow-hidden w-full"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={course.image || InstructorAvatar}
          alt={course?.name}
          className="w-full h-[180px] object-contain"
          onError={(e) => {
            e.currentTarget.src = InstructorAvatar;
          }}
        />

        {/* {course?.isSaved && <MedalIcon className="absolute top-2 end-2" />} */}
        <LevelBadge level={course?.level ?? "Beginner"} />
      </div>

      {/* Content Section */}
      <div className="p-2 pt-2 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <h4 className="text-sm font-semibold text-gray-400">
              {course?.category?.name}
            </h4>
            <h5
              className="font-semibold text-gray-800 line-clamp-1"
              title={course?.name}
            >
              {course?.name}
            </h5>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-400">
          {course?.educator?.title} / {course?.educator?.name}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="me-1">{course?.rate?.toFixed(1)}</span>
            {[...Array(Math.floor(course?.rate ?? 0))].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5" />
            ))}
          </div>
          <span className="text-gray-400 text-sm ms-2">
            ({course?.ratersCount ?? 0})
          </span>
        </div>

        <div className="flex mt-auto gap-4 justify-center relative z-20">
          {/* Saved Button */}
          <SaveButton
            id={course.id}
            isSaved={course.isSaved}
            messageForUnSaved={t("conent_unsaved")}
            messageForSaved={t("content_saved_successfully")}
            saveFunction={saveContent}
            invalidateQueriesKeys={[
              { queryKey: ["coursesForSlider", user?.programId] },
              { queryKey: ["savedContentsNav"] },
              { queryKey: ["getSavedCoursesList"] },
            ]}
          />

          <DefaultButton
            text={
              course?.isEnrolled ? (
                isFetchingNext ? (
                  <ButtonLoader />
                ) : (
                  t("Continue_Learning")
                )
              ) : (
                t("course_details")
              )
            }
            disabled={isFetchingNext}
            onClick={handleOpenCourse}
            type="button"
            moreStyle="min-w-[150px] rounded-3xl !py-1"
          />
        </div>
      </div>

      <CourseCardOverlayDetails course={course} />
    </motion.div>
  );
};

export default CourseCard;
