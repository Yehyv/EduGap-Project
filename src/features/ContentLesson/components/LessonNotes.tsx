import { Suspense, lazy, useState } from "react";
import AddNotesInLesson from "@/features/CourseDetails/components/AddNotesInLesson";
import { useLanguage } from "@/shared/localization/useLanguage";
import {
  getMyNotesInLesson,
  updateNoteInLesson,
  deleteNoteInLesson,
} from "../services/lessonsApis";
import { useParams, useSearchParams } from "react-router-dom";
import type { MyNotesInLessonTypeResponse } from "@/shared/types/sharedTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import CustomPagination from "@/shared/utils/CustomPagination";
import MyModal from "@/shared/components/ui/MyModal";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import TextareaField from "@/shared/components/forms/TextareaField";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

const TitleLine = lazy(() => import("@/assets/svgs/TitileLine.svg?react"));
const EditIcon = lazy(() => import("@/assets/svgs/EditTextIcon.svg?react"));
const TrashIcon = lazy(() => import("@/assets/svgs/TrashIcon.svg?react"));

const LessonNotes = () => {
  const { t } = useLanguage();
  const { lessonId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const queryClient = useQueryClient();

  // --- States for Modals ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{
    id: number;
    text: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery<MyNotesInLessonTypeResponse>({
    queryKey: ["getMyNotesInLesson", page, lessonId],
    queryFn: () => getMyNotesInLesson(page, lessonId!),
    enabled: !!lessonId,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const editMutation = useMutation({
    mutationFn: (payload: { id: number; text: string }) =>
      updateNoteInLesson(payload.id, payload.text),

    onMutate: () => {
      toast.dismiss("editNote");
      toast.loading(t("saving"), { toastId: "editNote" });
    },

    onSuccess: () => {
      toast.update("editNote", {
        render: t("note_updated"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      queryClient.invalidateQueries({
        queryKey: ["getMyNotesInLesson", page, lessonId],
        exact: true,
      });

      setEditModalOpen(false);
    },

    onError: () => {
      toast.update("editNote", {
        render: t("error"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNoteInLesson(id),

    onMutate: () => {
      toast.dismiss("deleteNote");
      toast.loading(t("loading"), { toastId: "deleteNote" });
    },

    onSuccess: () => {
      toast.update("deleteNote", {
        render: t("note_deleted"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      queryClient.invalidateQueries({
        queryKey: ["getMyNotesInLesson", page, lessonId],
        exact: true,
      });
      setDeleteModalOpen(false);
    },

    onError: () => {
      toast.update("deleteNote", {
        render: t("error"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  if (isLoading) return <CircleLoader />;
  if (error) return <div>{t("error_fetching_notes")}</div>;

  const notesList = data?.items || [];
  const notesCount = data?.pagination?.total ?? 0;

  return (
    <div className="min-h-[350px]">
      <div className="mb-5">
        <h4 className="mb-0">{t("notes")}</h4>
        <Suspense fallback={<div className="h-1 bg-gray-200 w-24 rounded" />}>
          <TitleLine className="w-22" />
        </Suspense>
      </div>

      <AddNotesInLesson noteslessonCount={notesCount} />

      {/* Notes List */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-10 mt-10">
        {notesList.length > 0 ? (
          notesList.map((noteItem, i) => (
            <div
              key={noteItem.id}
              className="w-full transition hover:shadow-md"
            >
              <h5 className="text-[#EF9F00] mb-2">
                {t("note")} {i + 1}
              </h5>

              <div className="relative bg-[#F3FEFF] min-h-[200px] rounded-xl border border-[#9E9C9C] p-3">
                <span>{noteItem.notes}</span>

                {/* Actions */}
                <div className="flex items-center gap-2 absolute bottom-2 end-2">
                  <EditIcon
                    className="cursor-pointer hover:scale-110 transition"
                    onClick={() => {
                      setSelectedNote({
                        id: noteItem.id,
                        text: noteItem.notes,
                      });
                      setEditModalOpen(true);
                    }}
                  />

                  <TrashIcon
                    className="cursor-pointer hover:scale-110 transition"
                    onClick={() => {
                      setSelectedNote({
                        id: noteItem.id,
                        text: noteItem.notes,
                      });
                      setDeleteModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 bg-gray-100 p-4 rounded-lg w-full">
            {t("no_notes_available")}
          </div>
        )}
      </div>

      <CustomPagination
        currentPage={data?.pagination?.page ?? 1}
        onPageChange={handlePageChange}
        totalPages={data?.pagination?.totalPages ?? 1}
      />

      {/*  Edit Modal */}
      {selectedNote && (
        <MyModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          headerTitle={t("edit_note")}
        >
          <Formik
            initialValues={{ note: selectedNote.text }}
            validationSchema={Yup.object({
              note: Yup.string().required(t("required")),
            })}
            onSubmit={(values) =>
              editMutation.mutate({ id: selectedNote.id, text: values.note })
            }
          >
            <Form className="flex flex-col gap-4">
              <label id="note">{t("edit_note")}:</label>
              <TextareaField
                placeholder={t("edit_note")}
                name="note"
                rows={4}
              />
              <DefaultButton text={t("save")} type="submit" />
            </Form>
          </Formik>
        </MyModal>
      )}

      {/*  Delete Modal */}
      {selectedNote && (
        <MyModal
          headerTitle={t("delete_note")}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
        >
          <p className="text-center text-xl text-gray-600">
            {t("confirm_delete")}
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <DefaultButton
              text={t("cancel")}
              type="button"
              moreStyle="!bg-gray-300 !text-black hover:!to-gray-400"
              onClick={() => setDeleteModalOpen(false)}
            />
            <DefaultButton
              text={t("delete")}
              type="button"
              onClick={() => deleteMutation.mutate(selectedNote.id)}
            />
          </div>
        </MyModal>
      )}
    </div>
  );
};

export default LessonNotes;
