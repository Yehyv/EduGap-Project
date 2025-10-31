import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rateContent } from "@/features/ContentLesson/services/lessonsApis";
import { useLanguage } from "@/shared/localization/useLanguage";

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

  const calculateRating = (
    index: number,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    return x < width / 2 ? index + 0.5 : index + 1;
  };

  const handleClick = (index: number, e: React.MouseEvent<HTMLSpanElement>) => {
    if (!editable || mutation.isPending) return;
    const newRating = calculateRating(index, e);
    setCurrentRating(newRating);
    mutation.mutate(newRating);
  };

  const displayedRating = hoverRating ?? currentRating;

  return (
    <div
      className={`flex gap-1 items-center justify-center ${
        mutation.isPending ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          onMouseMove={(e) =>
            editable &&
            !mutation.isPending &&
            setHoverRating(calculateRating(index, e))
          }
          onMouseLeave={() =>
            editable && !mutation.isPending && setHoverRating(null)
          }
          onClick={(e) => handleClick(index, e)}
          className="cursor-pointer"
        >
          {displayedRating >= index + 1 ? (
            <span className="text-yellow-400 text-3xl">★</span>
          ) : displayedRating >= index + 0.5 ? (
            <span className="relative text-3xl w-[28px] inline-block">
              <span
                className="absolute top-0 left-0.5 text-yellow-400 overflow-hidden"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              >
                ★
              </span>
              <span className="text-gray-300">★</span>
            </span>
          ) : (
            <span className="text-gray-300 text-3xl">★</span>
          )}
        </span>
      ))}
    </div>
  );
};

export default RatingReview;
