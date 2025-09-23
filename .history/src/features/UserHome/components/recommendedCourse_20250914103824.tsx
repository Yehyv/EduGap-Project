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
  const { lang } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [videoError, setVideoError] = useState(false);

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
    <div className="container my-5">
      <div
        className={`grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-[#F1F1F1] rounded-2xl overflow-hidden`}
        dir="auto"
      >
        {/* Video Section */}
        <div
          className={`} relative w-full h-[300px] md:h-[450px] md:col-span-3`}
        >
          {!isOnline ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-red-500">
              ⚠️ No internet connection
            </div>
          ) : videoError ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-red-500">
              ❌ Video failed to load
            </div>
          ) : (
            <video
              className="w-full h-full object-cover shadow"
              controls
              onError={() => setVideoError(true)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Content Section */}
        <div className={`md:col-span-2 px-6 py-4`}>
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
    </div>
  );
};

export default RecommendedCourse;
