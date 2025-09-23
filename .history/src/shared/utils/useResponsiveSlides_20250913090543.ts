import { useState, useEffect } from "react";

type BreakpointConfig = {
  width: number;
  slides: number;
};

export const useResponsiveSlides = (
  breakpoints: BreakpointConfig[],
  defaultSlides: number
) => {
  const [slidesToShow, setSlidesToShow] = useState(defaultSlides);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const updateSlides = () => {
      setWindowWidth(window.innerWidth);

      const matched = breakpoints.find((bp) => window.innerWidth < bp.width);
      if (matched) {
        setSlidesToShow(matched.slides);
      } else {
        setSlidesToShow(defaultSlides);
      }
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, [breakpoints, defaultSlides]);

  return { slidesToShow, windowWidth };
};
