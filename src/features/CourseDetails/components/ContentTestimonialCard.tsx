import type { ContentReviews } from "@/shared/types/sharedTypes";
import personImage from "@/assets/imgs/ForDev/Person.jpg";

const ContentTestimonialCard = ({
  Testimonials,
}: {
  Testimonials: ContentReviews;
}) => {
  return (
    <div
      className="bg-white shadow-md rounded-xl p-5 mx-4 my-4 max-w-xl border border-gray-100 transition hover:shadow-lg flex flex-col gap-4"
      dir="auto"
    >
      <div className="flex max-sm:flex-col max-sm:text-center items-center gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm">
          <img
            src={Testimonials?.user?.image || personImage}
            className="w-full h-full object-cover"
            alt="person"
          />
        </div>

        {/* Name + Institute */}
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold text-gray-800">
            {Testimonials?.user?.full_name}
          </h4>
          {/* Testimonial text */}
          <p className="text-gray-700 leading-6 line-clamp-4 italic text-sm max-sm:text-center">
            &rdquo;
            {Testimonials?.review ?? ""}
            &rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentTestimonialCard;
