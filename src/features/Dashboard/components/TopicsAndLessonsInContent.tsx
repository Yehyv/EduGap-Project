import { useState } from "react";
import PlusIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import PlusIconGray from "@/assets/svgs/PlusIconGray.svg?react";
import TrashIcon from "@/assets/svgs/TrashIconDashboard.svg?react";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import TimeIcon from "@/assets/svgs/TimeIcon.svg?react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  deleteTopicApi,
  getTopicsWithLessonsInContent,
} from "../services/dashboardApis";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { formatDuration } from "@/shared/utils/globals";
import { useLanguage } from "@/shared/localization/useLanguage";
import Swal from "sweetalert2";
import ButtonLoader from "@/shared/components/ButtonLoader";

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
  const { lang } = useLanguage();

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
        title: "Deleted",
        text: "Topic deleted successfully",
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
        title: "Error",
        text: "Something went wrong",
      });
    },
  });

  const handleDeleteTopic = (topicId: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
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
        <h4 className="text-secondary font-bold">Topics</h4>

        <Link
          to={`/dashboard/contents/${contentId}/add-new-topic`}
          className="text-secondary font-bold center py-1.5 px-3 transition text-sm"
        >
          <PlusIcon className="h-5" />
          Add New Topic
        </Link>
      </div>

      {/* ===== Topics List ===== */}
      {isLoading && <CircleLoader />}

      <div className="mt-4 space-y-3">
        {data?.data?.length == 0 && (
          <p className="text-gray-400 text-center">No Data Available</p>
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
                    {topic.lessons.length} Lessons
                  </p>
                </button>

                <div
                  className={`transition-all duration-300 relative overflow-auto ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {topic?.lessons?.length == 0 && (
                    <p className="text-gray-400 text-center bg-white">
                      there is no lessons in this topic
                    </p>
                  )}
                  <ul className="list-disc px-8 py-3 space-y-2  text-sm text-gray-700 bg-white marker:text-secondary">
                    {topic?.lessons?.map((lesson, index) => (
                      <li
                        key={index}
                        className=" marker:text-lg p-3 rounded-xl bg-[#F7FCFF]"
                      >
                        <div className="flex justify-between">
                          <Link
                            to={`/dashboard/contents/${contentId}/topics/${topic.id}/lessons/${lesson.id}`}
                          >
                            {index + 1} - {lesson.name}
                          </Link>
                          <span className="center gap-2">
                            {formatDuration(lesson?.duration, lang)}{" "}
                            <TimeIcon className="w-3" />
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
                      Add Lesson
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
