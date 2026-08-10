import { useState } from "react";
import PlusIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import PlusIconGray from "@/assets/svgs/PlusIconGray.svg?react";
import TrashIcon from "@/assets/svgs/TrashIconDashboard.svg?react";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  deleteLesson,
  deleteTopicApi,
  getTopicsWithLessonsInContent,
} from "../services/dashboardApis";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { LESSON_TYPES } from "@/shared/utils/globals";
import { useLanguage } from "@/shared/localization/useLanguage";
import Swal from "sweetalert2";
import ButtonLoader from "@/shared/components/ButtonLoader";
import DeleteButton from "./DeleteButton";

/* ===== Icons ===== */
const ArrowDown = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUp = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
    <path
      d="M18 15l-6-6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TopicsAndLessonsInContent = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const { lang, t } = useLanguage();

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };
  const { contentId } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["topicsAndLessonsInContent", contentId],
    queryFn: () => getTopicsWithLessonsInContent(contentId ?? ""),
  });

  const queryClient = useQueryClient();

  const { mutate: deleteTopic, isPending: isDeleting } = useMutation({
    mutationFn: deleteTopicApi,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("deleted"),
        text: t("topicDeletedSuccessfully"),
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["topicsAndLessonsInContent"],
      });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("somethingWentWrong"),
      });
    },
  });

  const handleDeleteTopic = (topicId: number) => {
    Swal.fire({
      title: t("areYouSure"),
      text: t("actionCannotBeUndone"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("yesDelete"),
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTopic(topicId);
      }
    });
  };

  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <>
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center pb-3">
        <h4 className="text-secondary font-bold">{t("topics")}</h4>

        <Link
          to={`/dashboard/contents/${contentId}/add-new-topic`}
          className="text-secondary font-bold center py-1.5 px-3 transition text-sm"
        >
          <PlusIcon className="h-5" />
          {t("addNewTopic")}
        </Link>
      </div>

      {/* ===== Topics List ===== */}
      {isLoading && <CircleLoader />}

      <div className="mt-4 space-y-3">
        {data?.data?.length == 0 && (
          <p className="text-gray-400 text-center">{t("noDataAvailable")}</p>
        )}

        {data?.data?.map((topic, index) => {
          const isOpen = openId === topic.id;
          return (
            <>
              <div key={topic.id} className="rounded-lg overflow-hidden">
                {/* ===== Header ===== */}
                <button
                  type="button"
                  onClick={() => toggle(topic.id)}
                  className="w-full px-4 py-3 bg-white hover:bg-[#F1F1F1] transition"
                >
                  <div className="flex justify-between items-center">
                    <h6 className="center gap-2 font-semibold text-gray-800">
                      <span>{index + 1} -</span>
                      {topic.name}
                      <span className="text-secondary">
                        {isOpen ? <ArrowUp /> : <ArrowDown />}
                      </span>
                    </h6>

                    <div className="flex justify-between gap-2">
                      <Link
                        to={`/dashboard/contents/${contentId}/edit-topic/${topic.id}`}
                        className="cursor-pointer"
                      >
                        <EditIcon />
                      </Link>

                      <button
                        onClick={(e) => {
                          handleDeleteTopic(topic.id);
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="cursor-pointer"
                      >
                        {isDeleting ? <ButtonLoader /> : <TrashIcon />}
                      </button>
                    </div>
                  </div>
                  <p className="text-start text-[#808080]">
                    {topic.lessons.length} {t("lessons")}
                  </p>
                </button>

                <div
                  className={`transition-all duration-300 relative overflow-auto ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {topic?.lessons?.length == 0 && (
                    <p className="text-gray-400 text-center bg-white">
                      {t("noLessonsInTopic")}
                    </p>
                  )}
                  <ul className="list-disc px-8 py-3 space-y-2  text-sm text-gray-700 bg-white marker:text-secondary">
                    {topic?.lessons?.map((lesson, index) => (
                      <li
                        key={index}
                        className={`marker:text-lg p-3 rounded-xl ${lesson?.lesson_type == LESSON_TYPES.LESSON ? "bg-[#F7FCFF]" : "bg-[#E4FFDD]"} `}
                      >
                        <div className="flex justify-between">
                          <Link
                            to={`/dashboard/contents/${contentId}/topics/${topic.id}/lessons/${lesson.id}`}
                          >
                            {index + 1} - {lesson.name}
                          </Link>
                          <span className="center gap-2">
                            {/* <EditIcon /> */}
                            <DeleteButton
                              deleteApi={() => deleteLesson(lesson.id)}
                              errorMessage={t("errorDeletingLesson")}
                              refetchFunction="topicsAndLessonsInContent"
                              successMessage={t("lessonDeleted")}
                            />
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Sticky Add Button */}
                  <div className="sticky bottom-0 bg-white px-8 py-3">
                    <Link
                      to={`/dashboard/contents/${contentId}/topic/${topic.id}/add-new-lesson`}
                      className="w-full center gap-1 dashed-border rounded-lg py-2 cursor-pointer text-[#808080]"
                    >
                      {t("addLesson")}
                      <PlusIconGray />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default TopicsAndLessonsInContent;
