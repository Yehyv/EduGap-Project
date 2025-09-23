import { useEffect, useState } from "react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SignalIcon from "@/assets/svgs/SignalIcon.svg?react";
import InternetIcon from "@/assets/svgs/InternetIcon.svg?react";
import LastUpdateIcon from "@/assets/svgs/LastUpdateIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIcon.svg?react";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import { useLanguage } from "@/shared/localization/useLanguage";

const infoItems = [
  { icon: TimeIcon, label: "مدة الدورة: 1 ساعة 50 دقيقة / 12 درس" },
  { icon: SignalIcon, label: "المستوى: عام" },
  { icon: InternetIcon, label: "اللغة: العربية" },
  { icon: LastUpdateIcon, label: "آخر تحديث: 31/8/2025" },
  { icon: CertificateIcon, label: "شهادة إتمام الدورة" },
];

const StatusMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center w-full h-full bg-gray-100 text-red-500 font-medium">
    {message}
  </div>
);

const CourseInfoList = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full md:w-[30%] bg-neutral-100 rounded-xl px-6 py-10">
      <h5 className="text-lg font-semibold mb-4">{t("about_course")}</h5>
      <ul className="space-y-4 mb-7">
        {infoItems.map(({ icon: Icon, label }, i) => (
          <li key={i} className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600 shrink-0" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <DefaultButton
        text={t("subscribe")}
        onClick={() => {}}
        type="button"
        moreStyle="px-10 mx-auto w-full !rounded-3xl"
      />
    </div>
  );
};

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
      <CourseInfoList />
      <div className="w-full md:w-[70%] h-[300px] md:h-[400px]">
        <CourseVideo videoUrl={videoUrl} isOnline={isOnline} />
      </div>
    </div>
  );
};

export default CourseDetails;
