import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rateContent } from "@/features/ContentLesson/services/lessonsApis";
import { useLanguage } from "@/shared/localization/useLanguage";
import DefaultButton from "./DefaultButton";

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
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const texts = {
    saving: t("saving_rating"),
    success: t("rating_saved"),
    error: t("error"),
  };

  const mutation = useMutation({
    mutationFn: (rating: number) => rateContent(courseId, rating),
    onMutate: () => {
      toast.dismiss("rate");
      toast.loading(texts.saving, { toastId: "rate" });
    },
    onSuccess: () => {
      toast.update("rate", {
        render: texts.success,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    },
    onError: () => {
      toast.update("rate", {
        render: texts.error,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  const handleClick = (index: number) => {
    if (!editable || mutation.isPending) return;
    const newRating = index + 1; // ✅ Full star only
    setCurrentRating(newRating);
    mutation.mutate(newRating);
  };

  const displayedRating = hoverRating ?? currentRating;

  return (
    <div>
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
        onClick={() => {}}
        type="button"
        moreStyle="!py-1 text-sm"
        text="leave a review"
      />
    </div>
  );
};

export default RatingReview;
