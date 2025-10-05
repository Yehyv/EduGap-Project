import React, { useState } from "react";

interface RatingReviewProps {
  totalStars?: number;
  currentRating?: number; // e.g. 3.5
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
  sizeClass?: string; // optional tailwind text size e.g. "text-3xl"
}

const STAR = "★";

const RatingReview: React.FC<RatingReviewProps> = ({
  totalStars = 5,
  currentRating = 0,
  onRatingChange,
  editable = true,
  sizeClass = "text-3xl",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Displayed rating: preview on hover else the current value
  const displayedRating = hoverRating !== null ? hoverRating : currentRating;

  // calculate fill percent (0..100) for a given star index based on displayedRating
  const getFillPercent = (index: number, value: number) => {
    const raw = value - index; // e.g. for index=2 and value=3.5 => 1.5
    const clamped = Math.max(0, Math.min(1, raw)); // 1 => full, 0.5 => half, 0 => empty
    return Math.round(clamped * 100);
  };

  // compute half/full depending on pointer position (left half -> .5, right half -> 1)
  const pointerToHalfOrFull = (index: number, clientX: number, el: Element) => {
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    // if pointer exactly in left half -> half, else full
    return x < rect.width / 2 ? index + 0.5 : index + 1;
  };

  const handleMouseMove = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!editable) return;
    const value = pointerToHalfOrFull(index, e.clientX, e.currentTarget);
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!editable) return;
    setHoverRating(null);
  };

  const handleClick = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!editable || !onRatingChange) return;
    const value = pointerToHalfOrFull(index, e.clientX, e.currentTarget);
    onRatingChange(value);
  };

  return (
    <div className="inline-flex gap-1 items-center select-none">
      {[...Array(totalStars)].map((_, i) => {
        const percent = getFillPercent(i, displayedRating); // 0, 50, 100
        return (
          <button
            key={i}
            type="button"
            onMouseMove={(e) => handleMouseMove(i, e)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(i, e)}
            aria-label={`Rate ${i + 1}`}
            disabled={!editable}
            className={`relative p-0 ${
              editable ? "cursor-pointer" : "cursor-default"
            } outline-none border-0 bg-transparent`}
          >
            {/* base (gray) star */}
            <span
              className={`${sizeClass} text-gray-300 leading-none`}
              aria-hidden
            >
              {STAR}
            </span>

            {/* overlay: left portion colored according to percent */}
            <span
              className="absolute left-0 top-0 overflow-hidden leading-none pointer-events-none"
              style={{ width: `${percent}%` }}
              aria-hidden
            >
              <span className={`${sizeClass} text-yellow-400`}>{STAR}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default RatingReview;
