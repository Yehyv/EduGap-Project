import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rateContent } from "@/features/ContentLesson/services/lessonsApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import MyModal from "./MyModal";
import AddReviewOnContent from "@/features/CourseDetails/components/AddReviewOnContent";
import DefaultButton from "./DefaultButton";
import { getMyCurrentRate } from "@/features/CourseDetails/services/contentDetails";
import type { CurrentUserRating } from "@/shared/types/sharedTypes";

interface RatingReviewProps {
  totalStars?: number;
  editable?: boolean;
  courseId: string;
}

const RatingReview: React.FC<RatingReviewProps> = ({
  totalStars = 5,
  editable = true,
  courseId,
}) => {
  const { t } = useLanguage();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const { data: currentUserRating } = useQuery<CurrentUserRating>({
    queryKey: ["currentUserRating", courseId],
    queryFn: () => getMyCurrentRate(courseId),
  });

  useEffect(() => {
    if (currentUserRating?.rating) {
      setCurrentRating(currentUserRating.rating);
    }
  }, [currentUserRating]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (rating: number) => rateContent(courseId, rating),
    onMutate: () => {
      toast.dismiss("rate");
      toast.loading(t("saving_rating"), { toastId: "rate" });
    },
    onSuccess: () => {
      toast.update("rate", {
        render: t("rating_saved"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserRating", courseId],
      });
    },
    onError: () => {
      toast.update("rate", {
        render: t("error"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  const handleClick = (index: number) => {
    if (!editable || mutation.isPending) return;
    const newRating = index + 1;

    setCurrentRating(newRating);
    mutation.mutate(newRating);
  };

  const displayedRating = hoverRating ?? currentRating;

  return (
    <div>
      {/* النجوم */}
      <div
        className={`flex gap-1 items-center justify-center mb-2 ${
          mutation.isPending ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {[...Array(totalStars)].map((_, index) => (
          <span
            key={index}
            onMouseEnter={() =>
              editable && !mutation.isPending && setHoverRating(index + 1)
            }
            onMouseLeave={() =>
              editable && !mutation.isPending && setHoverRating(null)
            }
            onClick={() => handleClick(index)}
            className="cursor-pointer"
          >
            {displayedRating >= index + 1 ? (
              <span className="text-yellow-400 text-3xl">★</span>
            ) : (
              <span className="text-gray-300 text-3xl">★</span>
            )}
          </span>
        ))}
      </div>

      <DefaultButton
        type="button"
        text={t("leave_a_comment")}
        onClick={() => setReviewModalOpen(true)}
        moreStyle="text-sm"
      />

      <MyModal
        headerTitle={t("review_content")}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
      >
        <AddReviewOnContent
          currentUserRate={currentUserRating?.rating}
          courseId={+courseId}
          onOpenChange={setReviewModalOpen}
        />
      </MyModal>
    </div>
  );
};

export default RatingReview;
