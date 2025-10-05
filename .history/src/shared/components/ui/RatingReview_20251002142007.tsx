import { useLanguage } from "@/shared/localization/useLanguage";
import React, { useState } from "react";

interface RatingReviewProps {
  totalStars?: number;
  editable?: boolean;
  direction?: "ltr" | "rtl";
}

const RatingReview: React.FC<RatingReviewProps> = ({
  totalStars = 5,
  editable = true,
}) => {
  const { lang } = useLanguage();
  const direction = lang === "en" ? "ltr" : "rtl";

  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  const handleClick = (
    index: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (!editable) return;

    const { width, left } = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - left;

    let rating: number;
    if (clickX < width / 2) {
      rating = index + 0.5;
    } else {
      rating = index + 1;
    }

    setCurrentRating(rating);
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

  const FullStar = () => <span className="text-yellow-400 text-4xl">★</span>;
  const EmptyStar = () => <span className="text-gray-300 text-4xl">★</span>;
  const HalfStar = () => (
    <span className="relative text-4xl w-6 inline-block">
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
    if (displayedRating >= index + 1) {
      return <FullStar />;
    } else if (displayedRating >= index + 0.5) {
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
