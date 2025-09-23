import StatusMessage from "@/shared/utils/StatusMessage";
import { useState } from "react";

const CourseVideo = ({
  videoUrl,
  isOnline,
}: {
  videoUrl: string;
  isOnline: boolean;
}) => {
  const [videoError, setVideoError] = useState(false);

  if (!isOnline) return <StatusMessage message="⚠️ لا يوجد اتصال بالإنترنت" />;
  if (videoError) return <StatusMessage message="❌ فشل تحميل الفيديو" />;

  return (
    <video
      className="w-full h-full object-cover shadow rounded-xl"
      controls
      onError={() => setVideoError(true)}
    >
      <source src={videoUrl} type="video/mp4" />
      متصفحك لا يدعم تشغيل الفيديو
    </video>
  );
};

export default CourseVideo;
