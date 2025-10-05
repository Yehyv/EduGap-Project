import React, { useState } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

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
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (!editable) return;

    const { width, left } = event.currentTarget.getBoundingClientRect();
    const hoverX = event.clientX - left;

    const rating = hoverX < width / 2 ? index + 0.5 : index + 1;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (editable) setHoverRating(null);
  };

  const handleClick = (
    index: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (!editable || !onRatingChange) return;

    const { width, left } = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - left;

    const rating = clickX < width / 2 ? index + 0.5 : index + 1;
    onRatingChange(rating);
  };

  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  const renderStarIcon = (index: number, ratingValue: number) => {
    if (ratingValue >= index + 1) {
      return <FaStar className="w-7 h-7" />; // full star
    }
    if (ratingValue >= index + 0.5) {
      return <FaStarHalfAlt className="w-7 h-7" />; // half star
    }
    return <FaRegStar className="w-7 h-7" />; // empty star
  };

  return (
    <div className="flex gap-1 justify-center items-center">
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          onMouseEnter={(event) => handleMouseEnter(index, event)}
          onMouseLeave={handleMouseLeave}
          onClick={(event) => handleClick(index, event)}
          className={`${
            editable ? "cursor-pointer" : "cursor-default"
          } text-yellow-400`}
        >
          {renderStarIcon(index, displayedRating)}
        </span>
      ))}
    </div>
  );
};

export default RatingReview;
