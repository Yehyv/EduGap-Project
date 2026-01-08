import SearchIcon from "@/assets/svgs/SearchIcon.svg?react";
import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllCoursesForDropdown,
  assignCourseToInstituteProgram,
} from "../services/dashboardApis";
import { useState } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

interface AddCourseToProgramProps {
  reviewModalOpen: boolean;
  setReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  programId: number;
}

const AddCourseToProgram = ({
  reviewModalOpen,
  setReviewModalOpen,
  programId,
}: AddCourseToProgramProps) => {
  const [currentChoice, setCurrentChoice] = useState<number | null>(null);
  const { lang } = useLanguage();
  const { instituteId } = useParams();
  // Fetch all courses
  const { data: allCourses } = useQuery({
    queryKey: ["getAllCoursesToAssign"],
    queryFn: getAllCoursesForDropdown,
  });

  // Mutation
  const { mutate, isLoading } = useMutation({
    mutationFn: ({
      courseId,
      programId,
    }: {
      courseId: number;
      programId: number;
    }) =>
      assignCourseToInstituteProgram(
        courseId,
        programId,
        instituteId ? +instituteId : 0
      ),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Course Assigned!",
        text: "The course has been successfully added to the program.",
      });
      setCurrentChoice(null); // reset selected course
      setReviewModalOpen(false); // close modal
    },
    onError: (err: any) => {
      setReviewModalOpen(false);

      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err?.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const handleAssignCourseToProgram = () => {
    if (!currentChoice) {
      Swal.fire({
        icon: "warning",
        title: "No Course Selected",
        text: "Please select a course to assign.",
      });
      return;
    }

    // Call mutation with both courseId and programId
    mutate({ courseId: currentChoice, programId });
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
            Add Course To Program
          </Dialog.Title>
        </div>
      }
      headerTitle={"Add Course"}
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
          {isLoading ? "Assigning..." : "Confirm Add"}
        </button>
        <button
          onClick={() => setReviewModalOpen(false)}
          className="rounded-2xl border border-[#808080] text-[#808080] px-8 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </AddModal>
  );
};

export default AddCourseToProgram;
