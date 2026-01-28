import AddIcon from "@/assets/svgs/PlusIconGray.svg?react";
import PlusIcon from "@/assets/svgs/PlusSign.svg?react";
import PlusBlueIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import DeleteIcon from "@/assets/svgs/TrashIconDashboard.svg?react";
import DragIcon from "@/assets/svgs/DragIcon.svg?react";
import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";

interface AddCourseToProgramProps {
  questionsData: any;
  lessonName: string;
  reviewModalOpen: boolean;
  setReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAddQuestionModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShowQuizQuestions = ({
  questionsData,
  lessonName,
  reviewModalOpen,
  setReviewModalOpen,
  setOpenAddQuestionModal,
}: AddCourseToProgramProps) => {
  return (
    <AddModal
      headerComponent={
        <div className="flex justify-between items-center border-b border-[#B6B5B5] pb-2">
          <Dialog.Title className={`text-center text-sm m-0 text-secondary`}>
            Add New Question
          </Dialog.Title>
          <Dialog.Close>
            <AddIcon className="rotate-45" />
          </Dialog.Close>
        </div>
      }
      headerTitle={"Add Question"}
      open={reviewModalOpen}
      onOpenChange={setReviewModalOpen}
      maxW="max-w-2xl"
    >
      <div className="flex justify-between -mt-4">
        <h5>Exam Questions ({lessonName ?? ""})</h5>
        <button
          onClick={() => {
            setReviewModalOpen(false);
            setOpenAddQuestionModal(true);
          }}
          className="rounded-lg bg-secondary text-white px-4 cursor-pointer disabled:opacity-50"
        >
          <PlusIcon className="inline-block w-6 me-2 h-6" />
          Add Question
        </button>
      </div>

      {questionsData?.data?.questions?.length == 0 && (
        <div className="dashed-border p-3 mt-5 rounded-lg text-center">
          <p className="text-gray-500 mb-2">No questions added yet.</p>
          <button className="text-secondary text-sm">
            Add the first question
            <PlusBlueIcon className="inline-block w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-3 max-h-[70vh] overflow-auto px-2">
        {questionsData?.data?.questions?.map((q, index) => (
          <div className="border border-[#ACACAC] rounded-md p-2">
            <div className="flex justify-between items-center max-md:items-start">
              <div className="md:flex gap-3 items-center">
                <DragIcon />
                <h6 className="text-[#757474]">Question Num {index + 1}</h6>
                <div className="bg-[#E9F7FF] text-sm rounded-2xl px-2 max-md:mb-1">
                  {q.answers.length > 2 ? "MCQs" : "T/F"}
                </div>
                <div className="bg-[#F1F1F1] text-sm rounded-2xl px-2">
                  One Point
                </div>
              </div>
              <div className="center">
                <button>
                  <EditIcon />
                </button>
                <button>
                  <DeleteIcon />
                </button>
              </div>
            </div>
            <p className="text-lg mx-4 md:mx-7 my-2">{q?.title}</p>
            <ul className="ps-2">
              {q?.answers?.map((a) => (
                <li>
                  <span>{a.label}</span> {")"} <span>{a.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5">
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

export default ShowQuizQuestions;
