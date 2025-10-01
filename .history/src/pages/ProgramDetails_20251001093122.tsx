import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
const ProgramDetails = () => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="relative bg-gradient-to-b from-primary to-[white] py-10 pb-16">
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <div className="container">
          <h5 className="font-bold mt-2">{t("program_title")}</h5>
          <h4 className="text-2xl mt-2">مبرمج بايثون محترف </h4>
          <div>
            <div>
              <div>3 كورسات</div>
              <VideoIcon />
            </div>
            <div>
              <div>12 ساعه و 35 دقيقة</div>
              <TimeIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;
