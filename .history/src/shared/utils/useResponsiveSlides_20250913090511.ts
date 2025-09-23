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

  useEffect(() => {
    const updateSlides = () => {
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

  return slidesToShow;
};
