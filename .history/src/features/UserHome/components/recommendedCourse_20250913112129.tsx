import { useEffect, useState } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";
import DefaultButton from "@/shared/components/ui/DefaultButton";

type Props = {
  videoUrl: string;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
};

const RecommendedCourse = ({
  videoUrl,
  title,
  description,
  buttonText,
  onButtonClick,
}: Props) => {
  const { lang } = useLanguage(); // assume it returns "en" or "ar"
  const [isOnline, setIsOnline] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // ✅ Handle network
  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-8 container bg-primary`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Video Section */}
      <div
        className={`order-1 ${
          lang === "ar" ? "md:order-2" : "md:order-1"
        } relative w-full h-[300px] md:h-[400px]`}
      >
        {!isOnline ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-xl text-red-500">
            ⚠️ No internet connection
          </div>
        ) : videoError ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-xl text-red-500">
            ❌ Video failed to load
          </div>
        ) : (
          <video
            className="w-full h-full object-cover rounded-xl shadow"
            controls
            onError={() => setVideoError(true)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Content Section */}
      <div
        className={`order-2 ${
          lang === "ar" ? "md:order-1 text-right" : "md:order-2 text-left"
        } px-4`}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          {title}
        </h2>
        <p className="text-gray-600 mb-5">{description}</p>
        <DefaultButton
          text={buttonText}
          onClick={onButtonClick}
          type="button"
        />
      </div>
    </div>
  );
};

export default RecommendedCourse;
