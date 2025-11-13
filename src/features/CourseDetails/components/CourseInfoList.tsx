import DefaultButton from "@/shared/components/ui/DefaultButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SignalIcon from "@/assets/svgs/SignalIcon.svg?react";
import InternetIcon from "@/assets/svgs/InternetIcon.svg?react";
import LastUpdateIcon from "@/assets/svgs/LastUpdateIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIcon.svg?react";
import SaveIcon from "@/assets/svgs/SaveIconWhite.svg?react";
import SavedIcon from "@/assets/svgs/SavedIcon.svg?react";
import ShareIcon from "@/assets/svgs/ShareIcon.svg?react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollContent,
  getContentAccessStatusForUser,
  saveContent,
} from "../services/contentDetails";
import Swal from "sweetalert2";
import ButtonLoader from "@/shared/components/ButtonLoader";
import { AxiosError } from "axios";
import type {
  ContentAccessType,
  ContentDetailsType,
} from "@/shared/types/sharedTypes";
import { toast } from "react-toastify";
import { useUser } from "@/features/auth/context/UserContext";
import { formatDuration } from "@/shared/utils/globals";
import { motion } from "framer-motion";

type StickyCourseSummaryCardProps = {
  contentDetailsCardData: Partial<ContentDetailsType>;
};

type ApiError = {
  message?: string[] | string;
};

const StickyCourseSummaryCard = ({
  contentDetailsCardData,
}: StickyCourseSummaryCardProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { user } = useUser();
  const isLoggedIn = !!localStorage.getItem("token");

  const { data: contentAccessStatus, isLoading } = useQuery<ContentAccessType>({
    queryKey: ["getContentAccessStatus", courseId],
    queryFn: () => getContentAccessStatusForUser(courseId!),
    enabled: isLoggedIn && !!courseId,
  });

  const isEnrolled = contentAccessStatus?.access === "enrolled";

  const mutation = useMutation({
    mutationFn: () => enrollContent(courseId ?? ""),
    onSuccess: () => {
      Swal.fire({
        title: t("done"),
        text: t("course_enrolled_success"),
        icon: "success",
        confirmButtonText: t("ok"),
      }).then(() => {
        navigate(`/course-lesson/${courseId}/${contentDetailsCardData?.id}`);
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
      if (contentDetailsCardData?.isSaved) {
        toast.warn(t("conent_unsaved"));
      } else {
        toast.success(t("content_saved_successfully"));
      }
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
      label: `${t("content_duration")} : ${formatDuration(
        contentDetailsCardData?.totalDuration ?? 0,
        lang
      )}`,
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
      navigate(`/course-lesson/${courseId}/${contentDetailsCardData?.id}`);
    }
    // if (!isEnrolled) {
    //   navigate(`/login`);
    // }
  };
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch (err) {
        console.error(err);
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <div className="w-full xl:sticky top-16 xl:w-[28%] bg-neutral-100 rounded-xl px-6 py-5 min-h-[300px] min-lg:h-[400px]">
      <h5 className="text-lg font-semibold mb-4">{t("about_course")}</h5>

      <ul className="space-y-3 mb-7">
        {infoItems.map(({ icon: Icon, label }, i) => (
          <li key={i} className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600 shrink-0" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      {!isLoading && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {isLoggedIn ? (
            <DefaultButton
              disabled={mutation.isPending}
              text={
                mutation.isPending ? (
                  <ButtonLoader />
                ) : isEnrolled ? (
                  t("Continue_Learning")
                ) : (
                  t("enroll")
                )
              }
              onClick={handleSubmit}
              type="button"
              moreStyle="px-10 !py-1.5 mx-auto w-full !rounded-3xl max-w-[220px]"
            />
          ) : (
            <DefaultButton
              disabled={mutation.isPending}
              text={t("login")}
              onClick={() => navigate("/login")}
              type="button"
              moreStyle="px-10 !py-1 mx-auto w-full !rounded-3xl max-w-[300px]"
            />
          )}
        </motion.div>
      )}

      <div className="flex justify-center mt-6 gap-4">
        <motion.div
          className="flex items-center gap-2 cursor-pointer relative"
          onClick={handleShare}
          whileTap={{ scale: 0.9 }} // only animates on click
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ShareIcon className="w-5 h-5" />
          <span className="whitespace-nowrap">{t("share_course")}</span>
        </motion.div>
        <motion.button
          className="bg-white rounded-full grid place-items-center cursor-pointer relative"
          whileHover={!isPending ? { scale: 1.1 } : {}}
          whileTap={!isPending ? { scale: 0.9 } : {}}
          disabled={isPending}
          onClick={() => {
            if (isLoggedIn) {
              mutateAsync(contentDetailsCardData?.id ?? 0);
            } else {
              toast.warning(t("must_be_logged_in"));
            }
          }}
        >
          {!isPending &&
            (contentDetailsCardData?.isSaved ? (
              <SavedIcon className="w-5 h-5" />
            ) : (
              <SaveIcon className="w-5 h-5" />
            ))}
          {isPending && (
            <motion.div
              className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                ease: "linear",
              }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default StickyCourseSummaryCard;
