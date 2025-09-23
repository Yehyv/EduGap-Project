import { useEffect, useState } from "react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SignalIcon from "@/assets/svgs/SignalIcon.svg?react";
const CourseDetails = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

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
    <div className="flex m-14 gap-4">
      <div className="w-[30%] bg-[#EFEFEF] rounded-xl">
        <h5>عن الدورة</h5>
        <ul>
          <li>
            <TimeIcon />
            مدة الدورة: 1 ساعة 50 دقيقة /12 درس
          </li>
          <li>
            <SignalIcon />
            مستوي: عام
          </li>
          <li>اللغة: العربية</li>
          <li>اخر تحديث: 31/8/2025</li>
          <li>شهادة اتمام الدورة</li>
        </ul>
      </div>
      <div
        className={`w-[70%] relative h-[300px] md:h-[400px] md:col-span-3 rounded-xl overflow-hidden`}
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
    </div>
  );
};

export default CourseDetails;
