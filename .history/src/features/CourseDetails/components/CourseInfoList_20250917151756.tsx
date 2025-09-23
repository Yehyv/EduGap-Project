import DefaultButton from "@/shared/components/ui/DefaultButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SignalIcon from "@/assets/svgs/SignalIcon.svg?react";
import InternetIcon from "@/assets/svgs/InternetIcon.svg?react";
import LastUpdateIcon from "@/assets/svgs/LastUpdateIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import ShareIcon from "@/assets/svgs/ShareIcon.svg?react";

const infoItems = [
  { icon: TimeIcon, label: "مدة الدورة: 1 ساعة 50 دقيقة / 12 درس" },
  { icon: SignalIcon, label: "المستوى: عام" },
  { icon: InternetIcon, label: "اللغة: العربية" },
  { icon: LastUpdateIcon, label: "آخر تحديث: 31/8/2025" },
  { icon: CertificateIcon, label: "شهادة إتمام الدورة" },
];
const StickyCourseSummaryCard = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full sticky top-10 md:w-[30%] bg-neutral-100 rounded-xl px-6 py-5 h-[300px] md:h-[400px]">
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

      <div className="flex justify-center mt-6 gap-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <ShareIcon />
          <div>{t("share_course")}</div>
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <SaveIcon />
          <div>{t("save_course")}</div>
        </div>
      </div>
    </div>
  );
};
export default StickyCourseSummaryCard;
