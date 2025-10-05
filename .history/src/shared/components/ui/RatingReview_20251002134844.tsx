import { useState } from "react";

export default function HalfStarRating({ initial = 0 }) {
  // allow decimal rating like 3.5 from props
  const [rating, setRating] = useState(initial);
  const [hover, setHover] = useState(null);

  // Handle star percentage fill (0, 50, 100)
  const getFillPercent = (star, value) => {
    if (value >= star) return 100; // full star
    if (value + 1 > star) return 50; // half star
    return 0; // empty
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const value = hover ?? rating; // hover preview OR saved rating
        const percent = getFillPercent(star, value);

        return (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star - 0.5)} // hover gives half-step preview
            onMouseLeave={() => setHover(null)}
            className="text-3xl transition-transform duration-200 hover:scale-110"
          >
            <span
              className="text-gray-300 relative"
              style={{
                background: `linear-gradient(90deg, #facc15 ${percent}%, #d1d5db ${percent}%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}
