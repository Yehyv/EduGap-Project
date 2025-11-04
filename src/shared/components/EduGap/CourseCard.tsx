import { motion } from "framer-motion";
import StarIcon from "@/assets/svgs/StarIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import MedalIcon from "@/assets/svgs/Medalcon.svg?react";
import InstructorAvatar from "@/assets/svgs/InstructorAvatar.svg";
import DefaultButton from "../ui/DefaultButton";
import type { CourseType } from "@/shared/types/sharedTypes";
import CourseCardOverlayDetails from "./CourseCardOverlayDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import LevelBadge from "../ui/LevelBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { saveContent } from "@/features/CourseDetails/services/contentDetails";
import { useUser } from "@/features/auth/context/UserContext";

const CourseCard = ({ course }: { course: CourseType }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<void, Error, number>({
    mutationFn: (contentId: number) => saveContent(contentId),
    onSuccess: () => {
      toast.success(t("content_saved_successfully"));
      queryClient.invalidateQueries({
        queryKey: ["coursesForSlider", user?.programId],
      });
    },
    onError: () => {
      toast.error(t("save_failed"));
    },
  });

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white rounded-xl shadow-custom overflow-hidden w-full cursor-pointer"
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

        {course?.isSaved && <MedalIcon className="absolute top-2 end-2" />}
        <LevelBadge level={course?.level ?? "Beginner"} />
      </div>

      {/* Content Section */}
      <div className="p-2 pt-2 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-400">
              {course?.name}
            </p>
            <h5
              className="font-semibold text-gray-800 line-clamp-1"
              title={course?.description}
            >
              {course?.description}
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

        <div className="flex mt-auto max-sm:gap-4 justify-center relative z-20">
          {!course?.isSaved && (
            <button
              type="button"
              disabled={isPending}
              className="absolute max-sm:static end-0 cursor-pointer transition-all duration-300 hover:scale-110 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (token) {
                  mutateAsync(course.id);
                } else {
                  toast.warning(t("must_be_logged_in"));
                }
              }}
            >
              <SaveIcon />
            </button>
          )}

          <DefaultButton
            text={
              course?.isEnrolled ? t("Continue_Learning") : t("course_details")
            }
            onClick={() => {
              navigate(
                token
                  ? `/user-course-details/${course.id}`
                  : `/guest-course-details/${course.id}`
              );
            }}
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
