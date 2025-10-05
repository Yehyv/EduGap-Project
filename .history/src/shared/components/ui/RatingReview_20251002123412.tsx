import React, { useState } from "react";

// Function to render the star icon
export const renderStarIcon = (index: number, ratingValue: number): string => {
  if (index < ratingValue) {
    if (ratingValue - index === 0.5) {
      return "star_half"; // Half-filled star
    }
    return "star"; // Fully filled star
  } else {
    return "star_border"; // Empty star
  }
};

interface RatingReviewProps {
  totalStars?: number; // Total number of stars
  currentRating?: number; // Current rating
  onRatingChange?: (rating: number) => void; // Callback for rating change
  editable?: boolean; // Whether the rating is editable or not
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

  const handleClick = (index: number, event: React.MouseEvent<HTMLElement>) => {
    if (!editable || !onRatingChange) return;

    const { width, left } = (
      event.target as HTMLElement
    ).getBoundingClientRect();
    const clickX = event.clientX - left;

    let rating: number;
    if (clickX < width / 2) {
      rating = index + 0.5;
    } else {
      rating = index + 1;
    }

    onRatingChange(rating);
  };

  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  return (
    <div
      className="rating"
      style={{
        display: "flex",
        gap: "4px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {[...Array(totalStars)].map((_, index) => (
        <i
          key={index}
          className="material-icons"
          onMouseEnter={(event) => handleMouseEnter(index, event)}
          onMouseLeave={handleMouseLeave}
          onClick={(event) => handleClick(index, event)}
          style={{
            cursor: editable ? "pointer" : "default",
            color: "#ffcc00",
            fontSize: "30px",
          }}
        >
          {renderStarIcon(index, displayedRating)}
        </i>
      ))}
    </div>
  );
};

export default RatingReview;
