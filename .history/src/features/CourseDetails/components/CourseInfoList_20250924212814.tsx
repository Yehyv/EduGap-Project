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
import ButtonLoader from "@/shared/components/ButtonLoader";
import { AxiosError } from "axios";

type StickyCourseSummaryCardProps = {
  buttonText: string;
  buttonLink: string;
  durationTime: string;
  levelName: string;
};

type ApiError = {
  message?: string[] | string;
};

const StickyCourseSummaryCard = ({
  buttonText,
  buttonLink,
  durationTime,
  levelName,
}: StickyCourseSummaryCardProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => enrollContent(courseId ?? ""),
    onSuccess: () => {
      Swal.fire({
        title: "Done!",
        text: "Your course was enrolled successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(buttonLink);
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage =
        error.response?.data?.message &&
        (Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message);

      Swal.fire({
        title: "Oops!",
        text: errorMessage || "Failed to enroll in the course",
        icon: "error",
        confirmButtonText: "OK",
      });
    },
  });

  const infoItems = [
    {
      icon: TimeIcon,
      label: `${t("content_duration")} : ${durationTime ?? 0}`,
    },
    { icon: SignalIcon, label: `المستوى: ${levelName ?? ""}` },
    { icon: InternetIcon, label: `${t("lang")}: العربية` },
    { icon: LastUpdateIcon, label: "آخر تحديث: 31/8/2025" },
    { icon: CertificateIcon, label: "شهادة إتمام الدورة" },
  ];

  const handleSubmit = () => {
    if (!courseId) {
      Swal.fire({
        title: "Error",
        text: "Course ID is missing",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
    mutation.mutate();
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
        text={mutation.isPending ? <ButtonLoader /> : buttonText}
        onClick={handleSubmit}
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
