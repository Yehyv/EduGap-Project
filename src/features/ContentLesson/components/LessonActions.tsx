import React, { Suspense, lazy } from "react";
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
  const dislikesCount = 0;
  const likesCount = 0;

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
      toast.error(t("save_lesson"));
      queryClient.invalidateQueries({
        queryKey: ["getLessonsActionsStatus", lessonId],
      });
    },
    onError: () => toast.error(t("save_failed")),
  });

  return (
    <div className="flex max-md:flex-col max-md:gap-3 justify-between py-2">
      <div className="flex max-md:justify-center flex-wrap gap-2 text-secondary">
        {/* Share Button */}
        <button className="bg-[#F5F5F5] rounded-3xl text-sm px-6 py-2 center gap-2 cursor-pointer">
          <LazyIcon Icon={ShareIcon} />
          <span>{t("share")}</span>
        </button>

        {/* Favorite */}
        <button
          onClick={() => saveLessonMutation.mutate()}
          className="bg-[#F5F5F5] rounded-3xl text-sm px-6 py-2 center gap-2 cursor-pointer"
        >
          {data?.savedStatus != "unsaved" ? (
            <LazyIcon className="w-5 h-5" Icon={FullStarIcon} />
          ) : (
            <LazyIcon Icon={FavStarIcon} />
          )}
          <span>{t("add_to_favorite_lessons")}</span>
        </button>

        {/* Like / Dislike */}
        <div className="bg-[#F5F5F5] rounded-3xl flex items-center gap-3 p-2">
          <div
            className="center gap-2 border-e border-secondary px-3 cursor-pointer"
            onClick={() => dislikeMutation.mutate()}
          >
            {data?.reactionStatus != "liked" ? (
              <LazyIcon
                className="w-7 h-7 rotate-180 transform [-scale-x-100]"
                Icon={likedIcon}
              />
            ) : (
              <LazyIcon Icon={DisLikeIcon} />
            )}
            <span>{dislikesCount}</span>
          </div>

          <div
            className="center gap-2 cursor-pointer"
            onClick={() => likeMutation.mutate()}
          >
            <span>{likesCount}</span>
            {data?.reactionStatus == "liked" ? (
              <LazyIcon className="w-7 h-7" Icon={likedIcon} />
            ) : (
              <LazyIcon Icon={LikeIcon} />
            )}
          </div>
        </div>
      </div>

      <h4 className="font-semibold">{lessonTitle}</h4>
    </div>
  );
};

export default LessonActions;
