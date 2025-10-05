import React, { useState } from "react";

interface RatingReviewProps {
  totalStars?: number;
  currentRating?: number;
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
  direction?: "ltr" | "rtl"; // لدعم العربي والإنجليزي
}

const RatingReview: React.FC<RatingReviewProps> = ({
  totalStars = 5,
  currentRating = 0,
  onRatingChange,
  editable = true,
  direction = "ltr",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  const handleClick = (
    index: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (!editable || !onRatingChange) return;

    const { width, left } = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - left;

    let rating: number;
    if (clickX < width / 2) {
      rating = index + 0.5;
    } else {
      rating = index + 1;
    }

    onRatingChange(rating);
  };

  const handleMouseMove = (
    index: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (!editable) return;

    const { width, left } = event.currentTarget.getBoundingClientRect();
    const hoverX = event.clientX - left;

    let rating: number;
    if (hoverX < width / 2) {
      rating = index + 0.5;
    } else {
      rating = index + 1;
    }

    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (editable) setHoverRating(null);
  };

  // نجمة كاملة
  const FullStar = () => <span className="text-yellow-400 text-3xl">★</span>;

  // نجمة فاضية
  const EmptyStar = () => <span className="text-gray-300 text-3xl">★</span>;

  // نص نجمة باستخدام clip-path
  const HalfStar = () => (
    <span className="relative text-3xl">
      <span
        className="absolute top-0 left-0 text-yellow-400 overflow-hidden"
        style={{ clipPath: "inset(0 50% 0 0)" }}
      >
        ★
      </span>
      <span className="text-gray-300">★</span>
    </span>
  );

  const renderStar = (index: number) => {
    const ratingValue = displayedRating;

    if (ratingValue >= index + 1) {
      return <FullStar />;
    } else if (ratingValue >= index + 0.5) {
      return <HalfStar />;
    } else {
      return <EmptyStar />;
    }
  };

  return (
    <div
      className={`flex gap-1 items-center ${
        direction === "rtl" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          onMouseMove={(event) => handleMouseMove(index, event)}
          onMouseLeave={handleMouseLeave}
          onClick={(event) => handleClick(index, event)}
          className={`cursor-${editable ? "pointer" : "default"}`}
        >
          {renderStar(index)}
        </span>
      ))}
    </div>
  );
};

export default RatingReview;
