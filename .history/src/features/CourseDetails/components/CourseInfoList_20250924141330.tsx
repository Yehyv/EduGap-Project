import DefaultButton from "@/shared/components/ui/DefaultButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SignalIcon from "@/assets/svgs/SignalIcon.svg?react";
import InternetIcon from "@/assets/svgs/InternetIcon.svg?react";
import LastUpdateIcon from "@/assets/svgs/LastUpdateIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIcon.svg?react";
import ShareIcon from "@/assets/svgs/ShareIcon.svg?react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { enrollContent } from "../services/contentDetails";
import Swal from "sweetalert2";

const StickyCourseSummaryCard = ({
  buttonText,
  buttonLink,
  durationTime,
  levelName,
}: {
  buttonText: string;
  buttonLink: string;
  durationTime: string;
  levelName: string;
}) => {
  const { courseId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: () => enrollContent("1"),
    onSuccess: (data) => {
      console.log(data);

      Swal.fire({
        title: "Done!",
        text: "Your course was enrolled successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    },
    onError: (error) => {
      console.error("❌ Failed to create course:", error);
      Swal.fire({
        title: "Oops!",
        text: "Something went wrong.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    },
  });

  const infoItems = [
    { icon: TimeIcon, label: `مدة الدورة: ${durationTime ?? 0}` },
    { icon: SignalIcon, label: `المستوى: ${levelName ?? ""}` },
    { icon: InternetIcon, label: "اللغة: العربية" },
    { icon: LastUpdateIcon, label: "آخر تحديث: 31/8/2025" },
    { icon: CertificateIcon, label: "شهادة إتمام الدورة" },
  ];
  const handleSubmit = (courseId: string) => {
    mutation.mutate(courseId);
  };

  return (
    <div className="w-full xl:sticky top-16 lg:w-[30%] bg-neutral-100 rounded-xl px-6 py-5 min-h-[300px] min-lg:h-[400px]">
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
        disabled={mutation.isPending}
        text={mutation.isPending ? "Submitting..." : buttonText}
        onClick={() => {
          handleSubmit(courseId);
          navigate(buttonLink);
        }}
        type="button"
        moreStyle="px-10 mx-auto w-full !rounded-3xl"
      />

      <div className="flex justify-center mt-6 xl:gap-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <ShareIcon />
          <div className="text-nowrap">{t("share_course")}</div>
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <SaveIcon />
          <div className="text-nowrap">{t("save_course")}</div>
        </div>
      </div>
    </div>
  );
};
export default StickyCourseSummaryCard;
