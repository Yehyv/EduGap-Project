import StatusMessage from "@/shared/utils/StatusMessage";
import { useEffect, useState } from "react";

const CourseVideo = ({
  videoUrl,
  isOnline,
}: {
  videoUrl: string;
  isOnline: boolean;
}) => {
  const [videoError, setVideoError] = useState(false);

  console.log(videoUrl);

  useEffect(() => {
    setVideoError(false);
  }, [videoUrl]);

  return (
    <div className="h-[300px] md:h-[400px]">
      {!isOnline || videoError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl shadow overflow-hidden">
          <StatusMessage
            message={
              !isOnline ? "⚠️ لا يوجد اتصال بالإنترنت" : "❌ فشل تحميل الفيديو"
            }
          />
        </div>
      ) : (
        <video
          className="w-full h-full object-cover shadow rounded-xl"
          controls
          onError={() => setVideoError(true)}
        >
          <source src={videoUrl} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      )}
    </div>
  );
};

export default CourseVideo;
