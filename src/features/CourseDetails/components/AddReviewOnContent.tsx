import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import TextareaField from "@/shared/components/forms/TextareaField";
import DefaultButton from "@/shared/components/ui/DefaultButton";
import { addReviewOnContent } from "../services/contentDetails";
import { useLanguage } from "@/shared/localization/useLanguage";
import ButtonLoader from "@/shared/components/ButtonLoader";

const AddReviewOnContent = ({
  courseId,
  onOpenChange,
  currentUserRate,
}: {
  courseId: number;
  onOpenChange: (open: boolean) => void;
  currentUserRate?: number;
}) => {
  const { t } = useLanguage();

  const mutation = useMutation({
    mutationFn: (review: string) => addReviewOnContent(courseId, review),
    onMutate: () => {
      toast.dismiss("addReview");
      toast.loading(t("saving_review"), { toastId: "addReview" });
      onOpenChange(false);
    },
    onSuccess: () => {
      toast.update("addReview", {
        render: t("review_submitted"),
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    },
    onError: () => {
      toast.update("addReview", {
        render: t("review_error"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    },
  });

  const schema = Yup.object({
    review: Yup.string().min(5, t("review_min")).required(t("review_required")),
  });

  return (
    <div className="w-full">
      <Formik
        initialValues={{ review: "" }}
        validationSchema={schema}
        onSubmit={(values, { resetForm }) => {
          mutation.mutate(values.review);
          resetForm();
        }}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            <div className="center">
              {[...Array(currentUserRate ?? 0)].map((_, index) => (
                <span key={index}>
                  <span className="text-yellow-400 text-3xl mx-1">★</span>
                </span>
              ))}
            </div>
            <h5 className="text-center">{t("leave_a_comment")}</h5>
            <TextareaField
              name="review"
              rows={4}
              placeholder={t("write_something")}
            />

            <div className="text-center">
              <DefaultButton
                type="submit"
                text={
                  isSubmitting || mutation.isPending ? (
                    <ButtonLoader />
                  ) : (
                    t("submit")
                  )
                }
                moreStyle="bg-secondary text-white py-2 px-4 rounded-md w-full disabled:opacity-50 max-w-[200px]"
                disabled={mutation.isPending}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddReviewOnContent;
