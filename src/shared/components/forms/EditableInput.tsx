import EditIcon from "@/assets/svgs/EditIcon.svg?react";
import { useMutation } from "@tanstack/react-query";
import { FormikInput } from "@/shared/components/forms/FormikInput";
import { Formik, Form } from "formik";
import { useState } from "react";
import { toast } from "react-toastify";
import ButtonLoader from "../ButtonLoader";
import { useLanguage } from "@/shared/localization/useLanguage";

export const EditableInput = ({
  label,
  name,
  type = "text",
  initialValue,
  validationSchema,
  updateFunction,
  refetchFunction,
  successMessage,
}: any) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: updateFunction,
    onSuccess: () => {
      if (refetchFunction) refetchFunction();
      setIsEditing(false);
      toast.success(successMessage);
    },
  });

  return (
    <Formik
      initialValues={{ [name]: initialValue }}
      validationSchema={validationSchema}
      onSubmit={(values) => mutate(values[name])}
      enableReinitialize
    >
      {() => (
        <>
          {label && (
            <label className="block mb-1 text-sm font-semibold">{label}:</label>
          )}
          <Form className="flex max-sm:flex-col gap-4 items-center relative mb-5">
            {/* Input */}
            <div className="flex-1 relative w-full">
              <FormikInput
                label={label}
                name={name}
                type={type}
                disabled={!isEditing}
              />

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute end-3 top-1.5 cursor-pointer"
                >
                  <EditIcon />
                </button>
              )}
            </div>

            {/* Buttons */}
            {isEditing && (
              <div className="flex gap-3 shrink-0">
                <button
                  type="submit"
                  className="bg-secondary text-white px-4 py-1.5 rounded"
                >
                  {isPending ? <ButtonLoader /> : t("save")}
                </button>

                <button
                  disabled={isPending}
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="border px-4 py-1 rounded"
                >
                  {t("cancel")}
                </button>
              </div>
            )}
          </Form>
        </>
      )}
    </Formik>
  );
};
