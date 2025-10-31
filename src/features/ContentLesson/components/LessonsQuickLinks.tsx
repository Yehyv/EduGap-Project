import StarIcon from "@/assets/svgs/BlackStarIcon.svg?react";
import WriteIcon from "@/assets/svgs/WriteIcon.svg?react";
import AttachementIcon from "@/assets/svgs/AttachmentIcon.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { Link } from "react-router-dom";

const LessonsQuickLinks = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { icon: StarIcon, label: t("important_lessons"), url: "" },
    { icon: WriteIcon, label: t("my_notes"), url: "" },
    { icon: AttachementIcon, label: t("course_attachments"), url: "" },
  ];

  return (
    <div className="mt-4 space-y-2">
      {quickLinks.map(({ icon: Icon, label, url }, i) => (
        <Link
          to={url}
          key={i}
          type="button"
          className="
            w-full flex items-center gap-2 shadow-custom rounded-xl 
            px-5 py-3 font-semibold text-start transition
            hover:bg-gray-100 active:scale-[0.98]
          "
        >
          <Icon className="inline-block w-5 h-5" />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
};

export default LessonsQuickLinks;
