import LessonHeader from "@/features/ContentLesson/components/LessonHeader";
import FavStarIcon from "@/assets/svgs/FavStarIcon.svg?react";
import CustomPagination from "@/shared/utils/CustomPagination";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";

import { lazy, useState } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { MyNotesInContentTypeResponse } from "@/shared/types/sharedTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MyModal from "@/shared/components/ui/MyModal";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import TextareaField from "@/shared/components/forms/TextareaField";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  updateNoteInLesson,
  deleteNoteInLesson,
  getMyNotesInContent,
} from "@/features/ContentLesson/services/lessonsApis";
import { formatDate, RESULTS_PER_PAGE } from "@/shared/utils/globals";

import { motion, AnimatePresence } from "framer-motion";

const EditIcon = lazy(() => import("@/assets/svgs/EditTextIcon.svg?react"));
const TrashIcon = lazy(() => import("@/assets/svgs/TrashIcon.svg?react"));

const MyNotes = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("commentsPage")) || 1;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{
    id: number;
    text: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery<MyNotesInContentTypeResponse>({
    queryKey: ["getMyNotesInContent", page, courseId],
    queryFn: () => getMyNotesInContent(page, RESULTS_PER_PAGE, courseId!),
    enabled: !!courseId,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ commentsPage: newPage.toString() });
  };

  // Flatten notes and keep lesson info
  const notesListWithLesson =
    data?.items?.flatMap((item) =>
      item.notes.map((note) => ({
        ...note,
        lessonName: item.lesson.name,
        lessonId: item.lesson.id,
      }))
    ) || [];

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
        queryKey: ["getMyNotesInContent", page, courseId],
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
        queryKey: ["getMyNotesInContent", page, courseId],
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

  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorMessage
        message={error?.message ?? "Error while fetching saved lessons"}
      />
    );

  return (
    <div className="container mb-20">
      <LessonHeader linkTo={-1} />
      <div className="container border border-[#9E9C9C] rounded-lg p-0 mt-5">
        <h4 className="border-b flex items-center gap-2 border-[#9E9C9C] p-5">
          <FavStarIcon />
          <span>{t("notes")}</span>
        </h4>

        {/* Notes List */}
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-10 mt-10 px-10 mb-10">
          <AnimatePresence>
            {notesListWithLesson.length > 0 ? (
              notesListWithLesson.map((noteItem, i) => (
                <motion.div
                  key={noteItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="w-full"
                >
                  {/* Show lesson name only once per lesson */}

                  <motion.h4
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-semibold"
                  >
                    {noteItem.lessonName}
                  </motion.h4>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="relative bg-[#F3FEFF] min-h-[200px] rounded-xl border border-[#9E9C9C] p-3 shadow-sm"
                  >
                    <h5 className="text-[#EF9F00] mb-2">
                      {t("note")} {i + 1}
                    </h5>
                    <span>{noteItem?.notes}</span>

                    {/* Actions */}
                    <div className="flex items-center justify-between w-full absolute bottom-2 end-0 px-4">
                      <Link
                        to={`/course-lesson/${courseId}/${noteItem?.lessonId}`}
                        className="text-secondary underline"
                      >
                        {t("go_to_lesson")}
                      </Link>
                      <div className="center gap-2">
                        <span className="text-gray-400">
                          <span>{t("last_update")} </span>
                          {formatDate(noteItem?.updated_at ?? "")}
                        </span>

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
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center col-span-2 max-md:col-span-1"
              >
                <div className="text-center text-gray-500 bg-gray-100 p-6 rounded-lg w-full h-[200px] flex items-center justify-center">
                  {t("no_notes_available")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {data?.pagination?.total != undefined &&
          data?.pagination?.total > 1 && (
            <CustomPagination
              currentPage={data?.pagination?.page ?? 1}
              onPageChange={handlePageChange}
              totalPages={data?.pagination?.totalPages ?? 1}
            />
          )}

        {/* Edit Modal */}
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

        {/* Delete Modal */}
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
    </div>
  );
};

export default MyNotes;
