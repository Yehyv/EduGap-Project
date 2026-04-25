import DefaultButton from "@/shared/components/ui/DefaultButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import SignalIcon from "@/assets/svgs/SignalIcon.svg?react";
import InternetIcon from "@/assets/svgs/InternetIcon.svg?react";
import LastUpdateIcon from "@/assets/svgs/LastUpdateIcon.svg?react";
import CertificateIcon from "@/assets/svgs/CertificateIcon.svg?react";
import ShareIcon from "@/assets/svgs/ShareIcon.svg?react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  enrollContent,
  getContentAccessStatusForUser,
  getContentProgressData,
  getNextLesson,
  saveContent,
} from "../services/contentDetails";
import Swal from "sweetalert2";
import ButtonLoader from "@/shared/components/ButtonLoader";
import { AxiosError } from "axios";
import type {
  ContentAccessType,
  ContentDetailsType,
  NextLessonType,
} from "@/shared/types/sharedTypes";
import { toast } from "react-toastify";
import { formatDuration, LESSON_TYPES } from "@/shared/utils/globals";
import { motion } from "framer-motion";
import LessonProgress from "@/features/ContentLesson/components/LessonProgress";
import SaveButton from "@/features/SavedIrems/components/SaveButton";
import { useUser } from "@/features/auth/context/UserContext";
import GetCertificateButton from "@/features/ContentLesson/components/GetCertificateButton";
import { fetchCertificate } from "@/features/ContentLesson/services/lessonsApis";

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
  const isLoggedIn = !!localStorage.getItem("token");
  const { user } = useUser();

  const { data: contentAccessStatus, isLoading } = useQuery<ContentAccessType>({
    queryKey: ["getContentAccessStatus", courseId],
    queryFn: () => getContentAccessStatusForUser(courseId!),
    enabled: isLoggedIn && !!courseId,
  });
  const { data: getNextLessonData } = useQuery<NextLessonType>({
    queryKey: ["getNextLesson", courseId],
    queryFn: () => getNextLesson(courseId!),
    enabled: isLoggedIn && !!courseId,
  });

  const { data: progress } = useQuery({
    queryKey: ["getContentProgress", courseId],
    queryFn: () => getContentProgressData(courseId!),
    enabled: !!isLoggedIn,
  });
  const NextLesson = getNextLessonData?.lessonId;

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

  const infoItems = [
    {
      icon: TimeIcon,
      label: `${t("content_duration")} : ${formatDuration(
        contentDetailsCardData?.totalDuration ?? 0,
        lang,
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
      const path =
        getNextLessonData?.lessonType == LESSON_TYPES.LESSON
          ? "course-lesson"
          : "quiz-page";

      navigate(`/${path}/${courseId}/${NextLesson}`);
    }
  };
  const handleShare = async () => {
    const url = window.location.href;
    const title = contentDetailsCardData?.title || document.title;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t("link_copied") || "Link copied to clipboard!");
      } catch {
        // Final fallback for older browsers
        const el = document.createElement("input");
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        toast.success(t("link_copied") || "Link copied to clipboard!");
      }
    };

    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      // Only use native share on mobile where it's reliable
      try {
        await navigator.share({ title, url });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // User didn't just close the sheet — fall back to clipboard
          await copyToClipboard();
        }
        // AbortError = user dismissed the sheet intentionally, do nothing
      }
    } else {
      // Desktop or unsupported: always copy to clipboard
      await copyToClipboard();
    }
  };

  return (
    <div className="flex flex-col justify-between w-full xl:sticky top-20 xl:w-[28%] bg-neutral-100 rounded-xl px-6 py-5 min-h-[300px] min-lg:h-fit">
      <h5 className="text-lg font-semibold mb-4">{t("about_course")}</h5>

      <ul className="space-y-3 mb-3">
        {infoItems.map(({ icon: Icon, label }, i) => (
          <li key={i} className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600 shrink-0" />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {isLoggedIn && isEnrolled && (
        <>
          <div className="whitespace-nowrap pe-3 text-secondary">
            <span className="mx-1">{t("lecture")}</span>
            <span>
              {progress?.completedLessons}/{progress?.totalLessons}
            </span>
          </div>
          <div className="mb-2">
            {isEnrolled && progress && (
              <LessonProgress courseName="" courseStats={progress} />
            )}
          </div>
        </>
      )}

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
                  progress?.completedLessons == progress?.totalLessons ? (
                    t("watch_again")
                  ) : (
                    t("Continue_Learning")
                  )
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
          {isLoggedIn && (
            <>
              {courseId && (
                <GetCertificateButton
                  className="mt-4 max-w-fit mx-auto"
                  courseId={courseId}
                  label={t("get_certificate") || "Get Certificate"}
                  fetchFunction={fetchCertificate}
                />
              )}
            </>
          )}
        </motion.div>
      )}

      <div className="mx-auto center justify-center mt-6 gap-4">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleShare}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ShareIcon className="w-5 h-5" />
          <span className="whitespace-nowrap">{t("share_course")}</span>
        </motion.div>
        <div className="relative">
          <SaveButton
            id={+courseId!}
            isSaved={contentDetailsCardData?.isSaved ?? false}
            messageForUnSaved={t("conent_unsaved")}
            messageForSaved={t("content_saved_successfully")}
            saveFunction={saveContent}
            invalidateQueriesKeys={[
              {
                queryKey: [
                  "getContentDetailsForEnrolledUsers",
                  courseId,
                  user?.programId,
                ],
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default StickyCourseSummaryCard;
