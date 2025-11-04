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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollContent, saveContent } from "../services/contentDetails";
import Swal from "sweetalert2";
import ButtonLoader from "@/shared/components/ButtonLoader";
import { AxiosError } from "axios";
import type { ContentDetailsType } from "@/shared/types/sharedTypes";
import { toast } from "react-toastify";
import { useUser } from "@/features/auth/context/UserContext";

type StickyCourseSummaryCardProps = {
  buttonText: string;
  buttonLink: string;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  contentDetailsCardData: Partial<ContentDetailsType>;
};

type ApiError = {
  message?: string[] | string;
};

const StickyCourseSummaryCard = ({
  buttonText,
  buttonLink,
  isEnrolled,
  isLoggedIn,
  contentDetailsCardData,
}: StickyCourseSummaryCardProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useUser();

  const mutation = useMutation({
    mutationFn: () => enrollContent(courseId ?? ""),
    onSuccess: () => {
      Swal.fire({
        title: t("done"),
        text: t("course_enrolled_success"),
        icon: "success",
        confirmButtonText: t("ok"),
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
        title: t("error"),
        text: errorMessage || t("failed_to_enroll"),
        icon: "error",
        confirmButtonText: t("ok"),
      });
    },
  });
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation<void, Error, number>({
    mutationFn: (contentId: number) => saveContent(contentId),
    onSuccess: () => {
      toast.success(t("content_saved_successfully"));
      queryClient.invalidateQueries({
        queryKey: [
          "getContentDetailsForEnrolledUsers",
          courseId,
          user?.programId,
        ],
      });
    },
    onError: () => {
      toast.error(t("save_failed"));
    },
  });

  const infoItems = [
    {
      icon: TimeIcon,
      label: `${t("content_duration")} : ${
        contentDetailsCardData?.totalDuration ?? 0
      }`,
    },
    {
      icon: SignalIcon,
      label: `${t("level")} : ${contentDetailsCardData?.levelName ?? ""}`,
    },
    {
      icon: InternetIcon,
      label: `${t("lang")} : ${contentDetailsCardData?.languageType}`,
    },
    {
      icon: LastUpdateIcon,
      label: `${t("last_update")} ${contentDetailsCardData?.lastUpdate}`,
    },
    { icon: CertificateIcon, label: ` ${t("certificate")}` },
  ];

  const handleSubmit = () => {
    if (!courseId) {
      Swal.fire({
        title: t("error"),
        text: t("course_id_missing"),
        icon: "error",
        confirmButtonText: t("ok"),
      });
      return;
    }
    if (!isEnrolled && isLoggedIn) {
      mutation.mutate();
    } else {
      navigate(buttonLink);
    }
  };

  return (
    <div className="w-full xl:sticky top-16 lg:w-[30%] bg-neutral-100 rounded-xl px-6 py-5 min-h-[300px] min-lg:h-[400px]">
      <h5 className="text-lg font-semibold mb-4">{t("about_course")}</h5>

      <ul className="space-y-3 mb-7">
        {infoItems.map(({ icon: Icon, label }, i) => (
          <li key={i} className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600 shrink-0" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <div className="text-center">
        <DefaultButton
          disabled={mutation.isPending}
          text={mutation.isPending ? <ButtonLoader /> : buttonText}
          onClick={handleSubmit}
          type="button"
          moreStyle="px-10 mx-auto w-full !rounded-3xl max-w-[300px]"
        />
      </div>

      <div className="flex justify-center mt-6 xl:gap-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <ShareIcon />
          <div className="text-nowrap">{t("share_course")}</div>
        </div>
        {!contentDetailsCardData?.isSaved && (
          <button
            type="button"
            disabled={isPending}
            className="flex items-center gap-2 relative cursor-pointer transition-all duration-300 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (localStorage.getItem("token")) {
                mutateAsync(contentDetailsCardData?.id ?? 0);
              } else {
                console.log("not saved");
                toast.warning(t("must_be_logged_in"));
              }
            }}
          >
            <SaveIcon />
            <div className="text-nowrap">{t("save_course")}</div>
          </button>
        )}
      </div>
    </div>
  );
};

export default StickyCourseSummaryCard;
