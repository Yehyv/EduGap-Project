import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignContentToExpert,
  getExpertCourses,
} from "../services/dashboardApis";
import { useState } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

interface AddCourseToProgramProps {
  reviewModalOpen: boolean;
  setReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddCourseToExpert = ({
  reviewModalOpen,
  setReviewModalOpen,
}: AddCourseToProgramProps) => {
  const [currentChoice, setCurrentChoice] = useState<number | null>(null);
  const { lang, t } = useLanguage();
  const { expertId } = useParams();

  // Fetch all courses
  const { data: allCourses } = useQuery({
    queryKey: ["getAllCourses"],
    queryFn: () => getExpertCourses(),
  });

  const queryClient = useQueryClient();

  // Mutation
  const { mutate, isLoading } = useMutation({
    mutationFn: ({
      expertId,
      contentId,
    }: {
      expertId: number | null;
      contentId: string | undefined;
    }) => assignContentToExpert(expertId, contentId),

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("contentAssigned"),
        text: t("contentAssignedToExpertSuccessfully"),
      });

      setCurrentChoice(null);
      setReviewModalOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["getExpertCourses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllCourses"],
      });
    },

    onError: (err: any) => {
      setReviewModalOpen(false);

      Swal.fire({
        icon: "error",
        title: t("failed"),
        text: err?.response?.data?.message || t("somethingWentWrong"),
      });
    },
  });

  const handleAssignCourseToExpert = (contentId: number | null) => {
    if (!currentChoice) {
      Swal.fire({
        icon: "warning",
        title: t("noCourseSelected"),
        text: t("pleaseSelectCourseToAssign"),
      });

      return;
    }

    mutate({ expertId, contentId });
  };

  return (
    <AddModal
      headerComponent={
        <div className="flex justify-between items-center">
          <div className="relative text-gray-600">
            <input
              className="border py-3.5 border-[#8A8A8A] w-full h-5 px-2 ps-10 rounded-xl text-sm focus:outline-none"
              type="search"
              placeholder={t("search")}
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
            {t("addContentToExpert")}
          </Dialog.Title>
        </div>
      }
      headerTitle={t("addContentToExpert")}
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

      {(!allCourses?.data || allCourses.data.length === 0) && (
        <p className="text-center text-gray-400">{t("noDataAvailable")}</p>
      )}

      <div className="flex justify-center gap-5 mt-5">
        <button
          onClick={() => handleAssignCourseToExpert(currentChoice)}
          disabled={isLoading}
          className="rounded-2xl bg-secondary text-white px-8 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? t("assigning") : t("confirmAdd")}
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

export default AddCourseToExpert;
