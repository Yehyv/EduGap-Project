import Slider from "react-slick";
import ArrowButton from "@/shared/components/ui/ArrowButton";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useResponsiveSlides } from "@/shared/utils/useResponsiveSlides";
import ContentTestimonialCard from "./ContentTestimonialCard";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { getContentReviews } from "../services/contentDetails";
import { useParams } from "react-router-dom";
import type { ContentReviewsResponse } from "@/shared/types/sharedTypes";

const ContentTestimonials = () => {
  const { lang, t } = useLanguage();
  const { courseId } = useParams();

  const {
    data: contentReviewsData,
    isLoading,
    isError,
  } = useQuery<ContentReviewsResponse>({
    queryKey: ["getContentReviews", courseId],
    queryFn: () => getContentReviews(courseId ?? ""),
  });

  const { slidesToShow, windowWidth } = useResponsiveSlides(
    [
      { width: 600, slides: 1 },
      { width: 1000, slides: 2 },
      { width: 1180, slides: 2 },
    ],
    2
  );

  const hasArrows = windowWidth >= 1180;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    accessibility: true,
    nextArrow:
      lang === "en" && hasArrows ? <ArrowButton direction="right" /> : <></>,
    prevArrow:
      lang === "ar" && hasArrows ? <ArrowButton direction="left" /> : <></>,
  };

  return (
    <div className="container relative py-10 px-0">
      {isLoading && (
        <p className="text-center text-gray-500 py-10">
          {t("loading_reviews")}
        </p>
      )}

      {isError && (
        <p className="text-center text-red-600 py-10">
          {t("error_loading_reviews")}
        </p>
      )}

      {!isLoading &&
        !isError &&
        (!contentReviewsData?.reviews ||
          contentReviewsData.reviews.length === 0) && (
          <p className="text-center text-gray-500 py-10">
            {t("no_reviews_yet")}
          </p>
        )}

      <div className="lg:me-14">
        {contentReviewsData?.reviews &&
          contentReviewsData.reviews.length > 0 && (
            <Slider {...settings}>
              {contentReviewsData.reviews.map((testimonial, index) => (
                <ContentTestimonialCard
                  key={index}
                  Testimonials={testimonial}
                />
              ))}
            </Slider>
          )}
      </div>
    </div>
  );
};

export default ContentTestimonials;
