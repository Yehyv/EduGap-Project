import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignContentToCourse,
  getAllContentsForDropdown,
} from "../services/dashboardApis";
import { useState } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

interface AssignContentToCourseProps {
  reviewModalOpen: boolean;
  setReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AssignContentToCourse = ({
  reviewModalOpen,
  setReviewModalOpen,
}: AssignContentToCourseProps) => {
  const [currentChoice, setCurrentChoice] = useState<number | null>(null);
  const { lang, t } = useLanguage();
  const { courseId } = useParams();

  // Fetch all courses
  const { data: allCourses } = useQuery({
    queryKey: ["getAllContentsToAssign"],
    queryFn: () => getAllContentsForDropdown(courseId ?? ""),
  });
  const queryClient = useQueryClient();

  // Mutation
  const { mutate, isLoading } = useMutation({
    mutationFn: ({
      contentId,
      courseId,
    }: {
      contentId: number;
      courseId: number;
    }) => assignContentToCourse(contentId, courseId),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("success_add_content"),
      });
      setCurrentChoice(null);
      setReviewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["getContentsForCourses"] });
    },
    onError: (err: any) => {
      setReviewModalOpen(false);

      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err?.response?.data?.message || t("somethingWentWrong"),
      });
    },
  });

  const handleAssignCourseToProgram = () => {
    if (!currentChoice) {
      Swal.fire({
        icon: "warning",
        title: t("noCourseSelected"),
        text: t("pleaseSelectCourseToAssign"),
      });
      return;
    }

    mutate({ contentId: currentChoice, courseId });
  };

  return (
    <AddModal
      headerComponent={
        <div className="flex justify-between items-center">
          <div className="relative text-gray-600">
            <input
              className="border py-3.5 border-[#8A8A8A] w-full h-5 px-2 ps-10 rounded-xl text-sm focus:outline-none"
              type="search"
              placeholder="Search..."
              dir={lang === "ar" ? "rtl" : "ltr"}
            />
            <button
              type="button"
              className="absolute start-2 top-1/2 -translate-y-1/2"
            >
              <SearchIcon className="w-7 h-7" />
            </button>
          </div>
          <Dialog.Title className={`text-center text-sm m-0 text-secondary`}>
            {t("addContentToCourse")}
          </Dialog.Title>
        </div>
      }
      headerTitle={"Add Content"}
      open={reviewModalOpen}
      onOpenChange={setReviewModalOpen}
    >
      <div className="flex flex-col gap-2 max-h-40 overflow-auto">
        {allCourses?.data.map((c) => (
          <button
            key={c.id}
            onClick={() => setCurrentChoice(c.id)}
            className={`cursor-pointer p-2 rounded-xl mx-2 text-start ${
              currentChoice === c.id ? "bg-[#E8F7FF]" : ""
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-5 mt-5">
        <button
          onClick={handleAssignCourseToProgram}
          disabled={isLoading}
          className="rounded-2xl bg-secondary text-white px-8 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? t("assigning") : t("confirm")}
        </button>
        <button
          onClick={() => setReviewModalOpen(false)}
          className="rounded-2xl border border-[#808080] text-[#808080] px-8 cursor-pointer"
        >
          {t("cancel")}
        </button>
      </div>
    </AddModal>
  );
};

export default AssignContentToCourse;
