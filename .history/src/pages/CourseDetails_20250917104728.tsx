import { useEffect, useState } from "react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SignalIcon from "@/assets/svgs/SignalIcon.svg?react";
import InternetIcon from "@/assets/svgs/InternetIcon.svg?react";
import LastUpdateIcon from "@/assets/svgs/LastUpdateIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIcon.svg?react";
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
      <div className="w-[30%] bg-[#EFEFEF] rounded-xl p-4">
        <h5 className="text-lg font-semibold mb-4">عن الدورة</h5>
        <ul className="space-y-3">
          <li className="flex items-center gap-2 text-sm">
            <TimeIcon className="w-5 h-5 text-gray-600" />
            <span>مدة الدورة: 1 ساعة 50 دقيقة / 12 درس</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <SignalIcon className="w-5 h-5 text-gray-600" />
            <span>المستوى: عام</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <InternetIcon className="w-5 h-5 text-gray-600" />
            <span>اللغة: العربية</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <LastUpdateIcon className="w-5 h-5 text-gray-600" />
            <span>آخر تحديث: 31/8/2025</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <CertificateIcon className="w-5 h-5 text-gray-600" />
            <span>شهادة إتمام الدورة</span>
          </li>
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
