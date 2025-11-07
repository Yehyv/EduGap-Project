import { lazy, useState } from "react";
import UserImage from "@/assets/svgs/UserIcon.svg";
import SendIcon from "@/assets/svgs/SendIcon.svg?react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import MyModal from "@/shared/components/ui/MyModal";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import { toast } from "react-toastify";

import {
  getComments,
  addComment,
  editComment,
  deleteComment,
} from "@/features/ContentLesson/services/lessonsApis";

import type {
  CommentsTypeResponse,
  CommentsType,
} from "@/shared/types/sharedTypes";

import { useParams, useSearchParams } from "react-router-dom";
import ButtonLoader from "../ButtonLoader";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";
import CircleLoader from "./CircleLoader";
import { useLanguage } from "@/shared/localization/useLanguage";
import CustomPagination from "@/shared/utils/CustomPagination";

const EditIcon = lazy(() => import("@/assets/svgs/EditTextIcon.svg?react"));
const TrashIcon = lazy(() => import("@/assets/svgs/TrashIcon.svg?react"));

const CommentsSection = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("commentsPage")) || 1;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentsType | null>(
    null
  );

  const { lessonId } = useParams();

  const { data, isLoading, isError } = useQuery<CommentsTypeResponse>({
    queryKey: ["comments", lessonId, page],
    queryFn: () => getComments(lessonId ?? "", page),
    enabled: !!lessonId,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ commentsPage: newPage.toString() });
  };

  //  Add Comment
  const addMutation = useMutation({
    mutationFn: (text: string) => addComment(lessonId ?? "", text),
    onMutate: () => {
      toast.dismiss("add");
      toast.loading(t("sending"), { toastId: "add" });
    },
    onSuccess: () => {
      toast.update("add", {
        render: t("sent"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["comments", lessonId] });
    },
    onError: () => {
      toast.update("add", {
        render: t("send_error"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  //  Edit
  const editMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      editComment(id, text),
    onMutate: () => {
      toast.dismiss("edit");
      toast.loading(t("saving"), { toastId: "edit" });
    },
    onSuccess: () => {
      toast.update("edit", {
        render: t("save_success"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["comments", lessonId] });
      setEditModalOpen(false);
      setSelectedComment(null);
    },
    onError: () => {
      toast.update("edit", {
        render: t("save_error"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  //  Delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onMutate: () => {
      toast.dismiss("delete");
      toast.loading(t("deleting"), { toastId: "delete" });
    },
    onSuccess: () => {
      toast.update("delete", {
        render: t("delete_success"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["comments", lessonId] });
      setDeleteModalOpen(false);
      setSelectedComment(null);
    },
    onError: () => {
      toast.update("delete", {
        render: t("delete_error"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  if (isError) return <SliderErrorFallback componentTitle={t("send_error")} />;

  if (isLoading) return <CircleLoader />;

  return (
    <>
      {/*  Add Comment */}
      <div className="mb-4 border rounded-lg border-[#D6D6D6] p-3 text-end">
        <Formik
          initialValues={{ text: "" }}
          validationSchema={Yup.object({
            text: Yup.string().trim().required(t("required")),
          })}
          onSubmit={(values, { resetForm }) => {
            addMutation.mutate(values.text);
            resetForm();
          }}
        >
          {() => (
            <Form>
              <div className="w-full flex gap-2">
                <div className="w-12 h-12 p-1 rounded-full bg-[#EDEDED]">
                  <img
                    src={UserImage}
                    className="w-full object-contain"
                    alt="user"
                  />
                </div>

                <Field
                  as="textarea"
                  name="text"
                  className="flex-1 w-full bg-[#EDEDED] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  placeholder={t("comment_placeholder")}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="bg-secondary mt-3 min-w-[100px] ms-auto text-white px-4 py-1 rounded hover:bg-secondary/90 cursor-pointer disabled:opacity-50"
                disabled={addMutation.isPending}
              >
                <SendIcon className="inline-block me-2 w-4" />
                {addMutation.isPending ? <ButtonLoader /> : t("send")}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {/*  Comments list */}
      {data?.items?.map((comment) => (
        <div
          key={comment.id}
          className="mb-4 border rounded-lg border-[#D6D6D6] p-3 text-end relative"
        >
          <div className="absolute top-2 end-2 flex gap-2">
            <EditIcon
              onClick={() => {
                setSelectedComment(comment);
                setEditModalOpen(true);
              }}
              className="cursor-pointer hover:scale-110 transition"
            />

            <TrashIcon
              onClick={() => {
                setSelectedComment(comment);
                setDeleteModalOpen(true);
              }}
              className="cursor-pointer hover:scale-110 transition"
            />
          </div>

          <div className="w-full flex gap-2">
            <img
              src={comment?.user?.image ?? UserImage}
              className="w-12 h-12 object-cover rounded-full"
              alt="user"
            />
            <div className="text-start">
              <h5>{comment?.user?.full_name ?? t("user")}</h5>
              <h6 className="text-[#939393] text-sm">
                {comment?.createdAt ?? ""}
              </h6>
              <p className="text-start mt-2">{comment?.comment}</p>
            </div>
          </div>
        </div>
      ))}
      {data?.items.length == 0 && (
        <div className="flex items-center justify-center col-span-2 max-md:col-span-1">
          <div className="text-center text-gray-500 bg-gray-100 p-6 rounded-lg w-full h-[200px] flex items-center justify-center">
            {t("no_comments_available")}
          </div>
        </div>
      )}

      {data?.pagination?.total != undefined && data?.pagination?.total > 1 && (
        <CustomPagination
          currentPage={data?.pagination?.page ?? 1}
          onPageChange={handlePageChange}
          totalPages={data?.pagination?.totalPages ?? 1}
        />
      )}

      {/*  Edit Modal */}
      {selectedComment && (
        <MyModal
          open={editModalOpen}
          onOpenChange={(v) => {
            setEditModalOpen(v);
            if (!v) setSelectedComment(null);
          }}
          headerTitle={t("edit_comment_title")}
        >
          <Formik
            initialValues={{ text: selectedComment.comment }}
            enableReinitialize
            validationSchema={Yup.object({
              text: Yup.string().trim().required(t("required")),
            })}
            onSubmit={(values) =>
              editMutation.mutate({ id: selectedComment.id, text: values.text })
            }
          >
            {() => (
              <Form className="flex flex-col gap-3">
                <label>{t("edit_comment_title")}:</label>
                <Field
                  as="textarea"
                  name="text"
                  rows={3}
                  className="border rounded p-2 w-full"
                />
                <ErrorMessage
                  name="text"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />

                <DefaultButton
                  text={editMutation.isPending ? <ButtonLoader /> : t("save")}
                  type="submit"
                  disabled={editMutation.isPending}
                  moreStyle="min-w-[120px] ms-auto"
                />
              </Form>
            )}
          </Formik>
        </MyModal>
      )}

      {/*  Delete Modal */}
      {selectedComment && (
        <MyModal
          open={deleteModalOpen}
          onOpenChange={(v) => {
            setDeleteModalOpen(v);
            if (!v) setSelectedComment(null);
          }}
          headerTitle={t("delete_comment_title")}
        >
          <p className="text-center text-gray-600 text-lg">
            {t("delete_confirm")}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <DefaultButton
              text={t("cancel")}
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
              moreStyle="!bg-gray-300 !text-black hover:!to-gray-400"
            />
            <DefaultButton
              text={
                deleteMutation.isPending ? (
                  <ButtonLoader />
                ) : (
                  t("delete_comment_title")
                )
              }
              type="button"
              onClick={() =>
                selectedComment && deleteMutation.mutate(selectedComment.id)
              }
              disabled={deleteMutation.isPending}
            />
          </div>
        </MyModal>
      )}
    </>
  );
};

export default CommentsSection;
