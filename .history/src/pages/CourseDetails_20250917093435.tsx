import { useEffect, useState } from "react";

const CourseDetails = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoUrl = "";

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
    <div className="flex m-15">
      <div className="w-[30%]">2</div>
      <div className="w-[70%]">
        {" "}
        <div className={`relative w-full h-[300px] md:h-[350px] md:col-span-3`}>
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
    </div>
  );
};

export default CourseDetails;
