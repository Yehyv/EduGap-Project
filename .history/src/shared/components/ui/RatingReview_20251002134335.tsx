import React, { useState } from "react";

const renderStarIcon = (index: number, ratingValue: number): string => {
  if (index < ratingValue) {
    if (ratingValue - index === 0.5) {
      return "⭐"; // ممكن تعمل نص نجمة بـ CSS بدل الرمز
    }
    return "⭐"; // Filled star
  } else {
    return "☆"; // Empty star
  }
};

interface RatingReviewProps {
  totalStars?: number;
  currentRating?: number;
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

  const handleMouseEnter = (
    index: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (!editable) return;
    const { width, left } = (
      event.target as HTMLElement
    ).getBoundingClientRect();
    const hoverX = event.clientX - left;
    let rating: number = hoverX < width / 2 ? index + 0.5 : index + 1;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (editable) setHoverRating(null);
  };

  const handleClick = (index: number, event: React.MouseEvent<HTMLElement>) => {
    if (!editable || !onRatingChange) return;
    const { width, left } = (
      event.target as HTMLElement
    ).getBoundingClientRect();
    const clickX = event.clientX - left;
    let rating: number = clickX < width / 2 ? index + 0.5 : index + 1;
    onRatingChange(rating);
  };

  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  return (
    <div className="flex gap-1 justify-center items-center">
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          onMouseEnter={(event) => handleMouseEnter(index, event)}
          onMouseLeave={handleMouseLeave}
          onClick={(event) => handleClick(index, event)}
          className="cursor-pointer text-yellow-400 text-2xl select-none"
        >
          {renderStarIcon(index, displayedRating)}
        </span>
      ))}
    </div>
  );
};

export default RatingReview;
