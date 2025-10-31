import React, { Suspense, lazy } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useMutation } from "@tanstack/react-query";
import { dislikeLesson, likeLesson } from "../services/lessonsApis";
import { toast } from "react-toastify";

const ShareIcon = lazy(() => import("@/assets/svgs/ShareIconBlue.svg?react"));
const FavStarIcon = lazy(() => import("@/assets/svgs/FavStarIcon.svg?react"));
const LikeIcon = lazy(() => import("@/assets/svgs/LikeIcon.svg?react"));
const DisLikeIcon = lazy(() => import("@/assets/svgs/DisLikeIcon.svg?react"));

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

  const dislikesCount = 21;
  const likesCount = 21;
  const likeMutation = useMutation({
    mutationFn: () => likeLesson(lessonId),
    onSuccess: () => {
      // refetch the likes count

      toast.success(t("like_submitted_successfully"));
    },
    onError: () => toast.error(t("like_failed")),
  });

  const dislikeMutation = useMutation({
    mutationFn: () => dislikeLesson(lessonId),
    onSuccess: () => {
      // refetch the likes count
      toast.success(t("like_submitted_successfully"));
    },
    onError: () => toast.error(t("dislike_failed")),
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
        <button className="bg-[#F5F5F5] rounded-3xl text-sm px-6 py-2 center gap-2 cursor-pointer">
          <LazyIcon Icon={FavStarIcon} />
          <span>{t("add_to_favorite_lessons")}</span>
        </button>

        {/* Like / Dislike */}
        <div className="bg-[#F5F5F5] rounded-3xl flex items-center gap-3 p-2">
          <div
            className="center gap-2 border-e border-secondary px-3 cursor-pointer"
            onClick={() => dislikeMutation.mutate()}
          >
            <LazyIcon Icon={DisLikeIcon} />
            <span>{dislikesCount}</span>
          </div>

          <div
            className="center gap-2 cursor-pointer"
            onClick={() => likeMutation.mutate()}
          >
            <span>{likesCount}</span>
            <LazyIcon Icon={LikeIcon} />
          </div>
        </div>
      </div>

      <h4 className="font-semibold">{lessonTitle}</h4>
    </div>
  );
};

export default LessonActions;
