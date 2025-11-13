import { Suspense, lazy } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dislikeLesson,
  getLessonActionsHistory,
  likeLesson,
  saveLesson,
} from "../services/lessonsApis";
import { toast } from "react-toastify";
import type { lessonActionsHistory } from "@/shared/types/sharedTypes";
import { motion, AnimatePresence } from "framer-motion";

const ShareIcon = lazy(() => import("@/assets/svgs/ShareIconBlue.svg?react"));
const FavStarIcon = lazy(() => import("@/assets/svgs/FavStarIcon.svg?react"));
const LikeIcon = lazy(() => import("@/assets/svgs/LikeIcon.svg?react"));
const likedIcon = lazy(() => import("@/assets/svgs/LikedIcon.svg?react"));
const DisLikeIcon = lazy(() => import("@/assets/svgs/DisLikeIcon.svg?react"));
const FullStarIcon = lazy(() => import("@/assets/svgs/FullStarIcon.svg?react"));

type LazyIconProps = {
  Icon: React.ComponentType<{ className?: string }>;
  className?: string;
};

const LazyIcon = ({ Icon, className = "w-5 h-5" }: LazyIconProps) => (
  <Suspense
    fallback={
      <div className="w-5 h-5 animate-pulse bg-gray-300 rounded-full" />
    }
  >
    <Icon className={className} />
  </Suspense>
);

const LessonActions = ({
  lessonId,
  lessonTitle,
}: {
  lessonId: string;
  lessonTitle: string;
}) => {
  const { t } = useLanguage();
  const { data } = useQuery<lessonActionsHistory>({
    queryKey: ["getLessonsActionsStatus", lessonId],
    queryFn: () => getLessonActionsHistory(lessonId),
  });

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => likeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getLessonsActionsStatus", lessonId],
      });
    },
    onError: () => toast.error(t("like_failed")),
  });

  const dislikeMutation = useMutation({
    mutationFn: () => dislikeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getLessonsActionsStatus", lessonId],
      });
    },
    onError: () => toast.error(t("dislike_failed")),
  });

  const saveLessonMutation = useMutation({
    mutationFn: () => saveLesson(lessonId),
    onSuccess: () => {
      toast.success(
        data?.savedStatus === "unsaved"
          ? t("save_lesson")
          : t("removed_from_saved_list")
      );
      queryClient.invalidateQueries({
        queryKey: ["getLessonsActionsStatus", lessonId],
      });
    },
    onError: () => toast.error(t("save_failed")),
  });

  const handleShare = () => {
    const url = window.location.href;
    const title = lessonTitle;

    if (navigator.share) {
      navigator.share({ title, text: t("share_material"), url });
    } else {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank"
      );
    }
  };

  return (
    <motion.div
      className="flex max-md:flex-col max-md:gap-3 justify-between py-2 min-h-[60px]"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h4 className="font-semibold">{lessonTitle}</h4>

      <div className="flex max-md:flex-col-reverse max-md:justify-center flex-wrap gap-2 text-secondary">
        {/*  Share Button Animated */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={handleShare}
          className="bg-[#F5F5F5] rounded-3xl text-sm px-6 py-2 center gap-2 cursor-pointer select-none"
        >
          <LazyIcon Icon={ShareIcon} />
          <span>{t("share")}</span>
        </motion.button>

        {/*  Favorite with animation */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => saveLessonMutation.mutate()}
          className="bg-[#F5F5F5] rounded-3xl text-sm px-6 ps-2 center gap-2 cursor-pointer select-none"
        >
          <AnimatePresence mode="wait">
            {data?.savedStatus !== "unsaved" ? (
              <motion.div
                key="saved"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <LazyIcon className="w-5 h-5" Icon={FullStarIcon} />
              </motion.div>
            ) : (
              <motion.div
                key="unsaved"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <LazyIcon Icon={FavStarIcon} />
              </motion.div>
            )}
          </AnimatePresence>
          <span>{t("add_to_favorite_lessons")}</span>
        </motion.button>

        {/*  Like / Dislike with smooth animation */}
        <div className="bg-[#F5F5F5] rounded-3xl flex items-center justify-center gap-3 px-3">
          {/* Dislike */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="center gap-2  cursor-pointer select-none"
            onClick={() => dislikeMutation.mutate()}
          >
            <AnimatePresence mode="wait">
              {data?.reactionStatus === "disliked" ? (
                <motion.div
                  key="disliked"
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                >
                  <LazyIcon
                    className="w-7 h-7 rotate-180 transform [-scale-x-100]"
                    Icon={likedIcon}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="dislike"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <LazyIcon Icon={DisLikeIcon} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span>|</span>
          {/* Like */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="center gap-2 cursor-pointer select-none"
            onClick={() => likeMutation.mutate()}
          >
            <AnimatePresence mode="wait">
              {data?.reactionStatus === "liked" ? (
                <motion.div
                  key="liked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <LazyIcon className="w-7 h-7" Icon={likedIcon} />
                </motion.div>
              ) : (
                <motion.div
                  key="like"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <LazyIcon Icon={LikeIcon} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LessonActions;
