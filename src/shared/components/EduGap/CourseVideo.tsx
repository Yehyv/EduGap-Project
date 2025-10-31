import { useLanguage } from "@/shared/localization/useLanguage";
import StatusMessage from "@/shared/utils/StatusMessage";
import { useEffect, useState } from "react";

const CourseVideo = ({
  videoUrl,
  isOnline,
}: {
  videoUrl: string;
  isOnline: boolean;
}) => {
  const { t } = useLanguage();
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setVideoError(false);
  }, [videoUrl]);

  return (
    <div className="h-[300px] md:h-[400px]">
      {!isOnline || videoError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl shadow overflow-hidden">
          <StatusMessage
            message={!isOnline ? t("no_internet") : t("failed_to_load")}
          />
        </div>
      ) : (
        <video
          className="w-full h-full object-cover shadow rounded-xl"
          controls
          onError={() => setVideoError(true)}
        >
          <source src={videoUrl} type="video/mp4" />
          {t("failed_to_load")}
        </video>
      )}
    </div>
  );
};

export default CourseVideo;
