import IconsGroup from "@/assets/svgs/iconsGroup.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import VideoIcon from "@/assets/svgs/VideoIcon.svg?react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import programImage from "@/assets/imgs/ForDev/programImage.jpg";
const ProgramDetails = () => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="relative bg-gradient-to-b from-primary to-[white] py-10 pb-16">
        <IconsGroup className="absolute start-0 end-0 top-0 bottom-0 w-full h-full" />
        <div className="container flex justify-between">
          <div className="w-1/2">
            <h5 className="font-bold mt-2">{t("program_title")}</h5>
            <h4 className="text-2xl mt-2">مبرمج بايثون محترف </h4>
            <div className="flex justify-between mt-4">
              <div className="flex gap-2">
                <VideoIcon />
                <div>3 كورسات</div>
              </div>
              <div className="flex gap-2">
                <TimeIcon />
                <div>12 ساعه و 35 دقيقة</div>
              </div>
            </div>
          </div>
          <div className="relative w-[240px] h-[240px]">
            <div className="absolute inset-0 bg-yellow-400 rounded-2xl" />
            <div className="absolute inset-0 rounded-2xl overflow-hidden -rotate-[30deg]">
              <img
                src={programImage}
                alt="program"
                className="w-full h-full object-cover rotate-[30deg] scale-150"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;
