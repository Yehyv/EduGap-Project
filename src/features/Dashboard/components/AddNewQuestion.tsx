import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { TextField } from "@/shared/components";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { useEffect } from "react";
import { createNewQuestion } from "../services/dashboardApis";

/* ================== Validation ================== */
const questionSchema = Yup.object({
  type: Yup.number().required("Question type is required"),

  titleEn: Yup.string().required("English question is required"),
  titleAr: Yup.string().required("Arabic question is required"),

  answers: Yup.array()
    .of(
      Yup.object({
        titleEn: Yup.string().required("English answer is required"),
        titleAr: Yup.string().required("Arabic answer is required"),
        isCorrect: Yup.boolean(),
      }),
    )
    .min(2, "At least two answers are required")
    .test(
      "one-correct",
      "One correct answer is required",
      (answers) => Array.isArray(answers) && answers.some((a) => a.isCorrect),
    ),
});

/* ================== Answers Templates ================== */
const mcqAnswers = [
  { label: "A", isCorrect: false, titleEn: "", titleAr: "" },
  { label: "B", isCorrect: false, titleEn: "", titleAr: "" },
  { label: "C", isCorrect: false, titleEn: "", titleAr: "" },
  { label: "D", isCorrect: false, titleEn: "", titleAr: "" },
];

const tfAnswers = [
  { label: "A", isCorrect: false, titleEn: "True", titleAr: "صح" },
  { label: "B", isCorrect: false, titleEn: "False", titleAr: "غلط" },
];

const AddNewQuestion = ({
  reviewModalOpen,
  setReviewModalOpen,
  setShowQuestionsModalOpen,
}: any) => {
  const { lessonId } = useParams();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createNewQuestion,
    onSuccess: () => {
      setReviewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["quizQuestions"] });
      Swal.fire("Success", "Question created successfully", "success").then(
        () => {
          setShowQuestionsModalOpen(true);
        },
      );
    },
    onError: () => {
      Swal.fire("Error", "Something went wrong", "error");
    },
  });

  const initialValues = {
    type: 0, // 0 = MCQ , 1 = T&F
    titleEn: "",
    titleAr: "",
    answers: mcqAnswers,
  };

  return (
    <AddModal
      maxW="max-w-2xl"
      open={reviewModalOpen}
      onOpenChange={setReviewModalOpen}
      headerComponent={
        <Dialog.Title className="text-secondary text-sm">
          Add Question
        </Dialog.Title>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={questionSchema}
        onSubmit={(values) => {
          const body = {
            lessonId: Number(lessonId),
            type: values.type,
            translations: [
              { languageId: 2, title: values.titleEn },
              { languageId: 1, title: values.titleAr },
            ],
            answers: values.answers.map((a) => ({
              label: a.label,
              isCorrect: a.isCorrect,
              translations: [
                { languageId: 2, title: a.titleEn },
                { languageId: 1, title: a.titleAr },
              ],
            })),
          };

          mutate(body);
        }}
      >
        {({ values, setFieldValue }) => {
          useEffect(() => {
            setFieldValue(
              "answers",
              values.type === 0 ? mcqAnswers : tfAnswers,
            );
          }, [values.type]);

          return (
            <Form>
              <div className="max-h-[75vh] overflow-auto px-2 -mt-4">
                <div className="flex flex-col gap-4">
                  {/* Question Type */}
                  <DropdownMenu
                    label="Question Type"
                    name="type"
                    options={[
                      { label: "Multiple Choice (MCQ)", value: 0 },
                      { label: "True / False", value: 1 },
                    ]}
                  />

                  {/* Question */}
                  <TextField
                    label="Question (English)"
                    name="titleEn"
                    placeholder="Question (English)"
                  />
                  <ErrorMessage
                    name="titleEn"
                    component="p"
                    className="error"
                  />

                  <TextField
                    label="السؤال (عربي)"
                    name="titleAr"
                    placeholder="السؤال (عربي)"
                  />
                  <ErrorMessage
                    name="titleAr"
                    component="p"
                    className="error"
                  />

                  {/* Answers */}
                  {values.answers.map((answer, index) => (
                    <div
                      key={answer.label}
                      className="border border-[#ACACAC] p-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          id={answer.label}
                          type="radio"
                          name="correct"
                          checked={answer.isCorrect}
                          onChange={() =>
                            values.answers.forEach((_, i) =>
                              setFieldValue(
                                `answers.${i}.isCorrect`,
                                i === index,
                              ),
                            )
                          }
                        />
                        <label for={answer.label}>Correct Answer</label>
                      </div>

                      <div className="flex gap-2">
                        <TextField
                          name={`answers.${index}.titleEn`}
                          placeholder={`Answer ${answer.label} (EN)`}
                        />
                        <TextField
                          name={`answers.${index}.titleAr`}
                          placeholder={`Answer ${answer.label} (AR)`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="bg-secondary text-white rounded-xl py-2 px-4 mt-2"
              >
                {isPending ? "Creating..." : "Save Question"}
              </button>
            </Form>
          );
        }}
      </Formik>
    </AddModal>
  );
};

export default AddNewQuestion;
