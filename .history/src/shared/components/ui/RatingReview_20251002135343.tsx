import React, { useState } from "react";

interface RatingReviewProps {
  totalStars?: number;
  currentRating?: number; // e.g. 3.5
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
}

const RatingReview: React.FC<RatingReviewProps> = ({
  totalStars = 5,
  currentRating = 0,
  onRatingChange,
  editable = true,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  const getStar = (index: number): string => {
    if (index + 1 <= displayedRating) {
      return "★"; // full
    } else if (index + 0.5 === displayedRating) {
      return "⯨"; // half (بديل نص نجمة Unicode — ممكن تغيرها ب SVG)
    } else {
      return "☆"; // empty
    }
  };

  const handleMouseMove = (
    index: number,
    e: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (!editable) return;
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const rating = x < width / 2 ? index + 0.5 : index + 1;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (!editable) return;
    setHoverRating(null);
  };

  const handleClick = (index: number, e: React.MouseEvent<HTMLSpanElement>) => {
    if (!editable || !onRatingChange) return;
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const rating = x < width / 2 ? index + 0.5 : index + 1;
    onRatingChange(rating);
  };

  return (
    <div className="flex gap-1 justify-center items-center text-3xl text-yellow-400">
      {Array.from({ length: totalStars }).map((_, i) => (
        <span
          key={i}
          onMouseMove={(e) => handleMouseMove(i, e)}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => handleClick(i, e)}
          className={editable ? "cursor-pointer" : "cursor-default"}
        >
          {getStar(i)}
        </span>
      ))}
    </div>
  );
};

export default RatingReview;
