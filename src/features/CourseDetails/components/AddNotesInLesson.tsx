import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField } from "@/shared/components";
import SelectField from "@/shared/components/forms/SelectField";
import TextareaField from "@/shared/components/forms/TextareaField";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContentTopics } from "../services/contentDetails";
import { addLessonNote } from "@/features/ContentLesson/services/lessonsApis";
import { useParams, useSearchParams } from "react-router-dom";
import type { ContentTopicsType } from "@/shared/types/sharedTypes";
import { toast } from "react-toastify";
import ButtonLoader from "@/shared/components/ButtonLoader";

const AddNotesInLesson = () => {
  const { t } = useLanguage();
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Fetch topics
  const { data } = useQuery<ContentTopicsType[]>({
    queryKey: ["getTopicsInContent", courseId],
    queryFn: () => getContentTopics(courseId!),
    enabled: !!courseId,
    retry: 1,
  });

  // Prepare lessons options
  const allLessons =
    data?.flatMap((item) =>
      item.lessons.map((lesson) => ({
        label: lesson.name,
        value: lesson.id,
      }))
    ) || [];

  const { mutateAsync, isPending } = useMutation<
    void,
    Error,
    { noteName: string; notes: string; lessonName: string }
  >({
    mutationFn: (noteData) => addLessonNote(noteData.lessonName, noteData),
    onSuccess: () => {
      toast.success(t("note_saved_successfully"));
      setSearchParams({ page: "1" });
      queryClient.invalidateQueries(["getMyNotesInLesson", page, lessonName]);
    },
    onError: () => {
      toast.error(t("note_save_failed"));
    },
  });

  return (
    <Formik
      initialValues={{ noteName: "", notes: "", lessonName: "" }}
      validationSchema={Yup.object({
        noteName: Yup.string().max(20, t("note_max")).required(t("required")),
        notes: Yup.string()
          .max(200, t("note_max"))
          .required(t("note_required")),
        lessonName: Yup.string().required(t("lesson_required")),
      })}
      onSubmit={async (values, { resetForm }) => {
        mutateAsync(values, {
          onSuccess: () => resetForm(),
        });
      }}
    >
      {({ handleSubmit, resetForm }) => (
        <Form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="flex gap-4 items-start">
            <div className="w-1/4">
              <Field
                as={TextField}
                maxLength={20}
                name="noteName"
                type="text"
                placeholder={t("note_title")}
                label=""
              />
            </div>

            <div className="w-full mt-1">
              <Field
                as={SelectField}
                name="lessonName"
                placeholder={t("lesson_name")}
                options={allLessons}
                label=""
              />
            </div>
          </div>

          <TextareaField
            name="notes"
            label=""
            placeholder={t("write_note_here")}
            rows={3}
          />

          <div className="flex gap-2 justify-end">
            <DefaultButton
              onClick={() => {
                resetForm();
              }}
              text={t("cancel")}
              type="button"
              moreStyle="!bg-white !text-black hover:!to-primary"
            />

            <DefaultButton
              text={isPending ? <ButtonLoader /> : t("save_note")}
              type="submit"
              disabled={isPending}
              moreStyle="min-w-[100px]"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddNotesInLesson;
