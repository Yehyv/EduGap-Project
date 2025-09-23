import { useEffect, useState } from "react";
import CourseVideo from "@/shared/components/EduGap/CourseVideo";
import CourseInfoList from "@/features/CourseDetails/components/CourseInfoList";

const CourseDetails = () => {
  const [isOnline, setIsOnline] = useState(true);
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
    <div className="flex flex-col md:flex-row m-6 md:m-14 gap-6">
      <div className="w-full md:w-[80%] min-h-[300px] md:min-h-[400px]">
        <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />
      </div>
      <CourseInfoList />
    </div>
  );
};

export default CourseDetails;
