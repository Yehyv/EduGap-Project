import React, { useState } from "react";

interface RatingReviewProps {
  totalStars?: number;
  currentRating?: number; // e.g. 3.5
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
}

const StarFull = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8 text-yellow-400"
  >
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.401 8.171L12 18.897l-7.335 3.866 1.401-8.171L.132 9.21l8.2-1.192z" />
  </svg>
);

const StarEmpty = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-8 h-8 text-yellow-400"
  >
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.401 8.171L12 18.897l-7.335 3.866 1.401-8.171L.132 9.21l8.2-1.192z" />
  </svg>
);

const StarHalf = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-8 h-8 text-yellow-400"
  >
    <defs>
      <linearGradient id="halfGradient">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.401 8.171L12 18.897l-7.335 3.866 1.401-8.171L.132 9.21l8.2-1.192z"
      fill="url(#halfGradient)"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const RatingReview: React.FC<RatingReviewProps> = ({
  totalStars = 5,
  currentRating = 0,
  onRatingChange,
  editable = true,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  const getStar = (index: number) => {
    if (index + 1 <= displayedRating) return <StarFull />;
    if (index + 0.5 === displayedRating) return <StarHalf />;
    return <StarEmpty />;
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
    <div className="flex gap-1 justify-center items-center">
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
