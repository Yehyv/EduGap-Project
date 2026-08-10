import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useParams, useSearchParams } from "react-router-dom";
import { TextField } from "@/shared/components";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { phoneKeys } from "@/shared/utils/globals";
import {
  createStudentToInstitute,
  getAllProgramsForStudent,
} from "../services/dashboardApis";
import ButtonLoader from "@/shared/components/ButtonLoader";
import { useLanguage } from "@/shared/localization/useLanguage";

/* ================== Validation ================== */
const studentSchema = Yup.object({
  full_name: Yup.string()
    .min(3, "Full name must be at least 3 characters")
    .required("Full name is required"),

  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),

  national_id: Yup.string()
    .matches(/^[23]\d{13}$/, "Invalid Egyptian National ID")
    .required("National ID is required"),

  phone_key: Yup.string().required("Phone key is required"),

  phone: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Phone must be 10-11 digits")
    .required("Phone number is required"),
});

interface Props {
  reviewModalOpen: boolean;
  setReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddNewStudentToInstitute = ({
  reviewModalOpen,
  setReviewModalOpen,
}: Props) => {
  const { instituteId } = useParams();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data } = useQuery({
    queryKey: ["getAllProgramsForStudent", instituteId],
    queryFn: () => getAllProgramsForStudent(instituteId ?? ""),
  });

  const handleProgramsData = data?.data.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const { mutate, isPending } = useMutation({
    mutationFn: createStudentToInstitute,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: t("success"),
        text: t("studentCreatedSuccess"),
        confirmButtonColor: "#0d6efd",
      });
      setReviewModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["getStudentsInInstitute"],
      });
    },
    onError: (err: any) => {
      handleCloseModal();
      const message = err?.response?.data?.message;
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: Array.isArray(message)
          ? message.join(", ")
          : message || t("somethingWentWrong"),
        confirmButtonColor: "#dc3545",
      });
    },
  });

  const initialValues = {
    full_name: "",
    email: "",
    national_id: "",
    phone_key: "20",
    phone: "",
    user_image: "",
    instituteId: instituteId || "",
    programId: "",
    studentId: "",
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const handleCloseModal = () => {
    setReviewModalOpen(false);
    searchParams.delete("openAddStudent");
    setSearchParams(searchParams);
  };

  return (
    <AddModal
      maxW="max-w-2xl"
      open={reviewModalOpen}
      onOpenChange={setReviewModalOpen}
      headerComponent={
        <Dialog.Title className="text-secondary text-xl font-semibold">
          {t("addNewStudent")}
        </Dialog.Title>
      }
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={studentSchema}
        onSubmit={(values, { resetForm }) => {
          const body = {
            full_name: values.full_name.trim(),
            email: values.email.trim().toLowerCase(),
            national_id: values.national_id.trim(),
            phone_key: values.phone_key,
            phone: values.phone.trim(),
            user_image: values.user_image,
            instituteId: Number(instituteId),
            programId: values.programId,
            studentId: +values?.studentId,
          };

          mutate(body, {
            onSuccess: () => {
              resetForm();
            },
          });
        }}
      >
        {({ isValid, dirty }) => (
          <Form
            className="flex flex-col h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto overflow-x-hidden px-2">
              <TextField
                label={t("fullName")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                name="full_name"
                placeholder={t("enterFullName")}
                autoComplete="name"
              />

              <TextField
                label={t("studentId")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                name="studentId"
                placeholder={t("enterStudentId")}
                onlyNumbers
              />

              <DropdownMenu
                label={t("program")}
                name="programId"
                options={handleProgramsData}
              />

              <div className="flex gap-3">
                <div className="w-[120px] shrink-0">
                  <DropdownMenu
                    label={t("phoneKey")}
                    name="phone_key"
                    options={phoneKeys}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <TextField
                    moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
                    label={t("phone")}
                    name="phone"
                    type="tel"
                    placeholder={t("enterPhone")}
                    autoComplete="tel"
                    onlyNumbers
                  />
                </div>
              </div>

              <TextField
                label={t("email")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                name="email"
                type="email"
                placeholder={t("enterEmail")}
                autoComplete="email"
              />

              <TextField
                label={t("nationalId")}
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                name="national_id"
                placeholder={t("enterNationalId")}
                onlyNumbers
                maxLength={14}
              />
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl py-2 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("cancel")}
              </button>

              <button
                type="submit"
                disabled={isPending || !isValid || !dirty}
                className="bg-secondary hover:bg-secondary-dark text-white rounded-xl py-2 px-6 min-w-[140px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <ButtonLoader /> : t("saveStudent")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </AddModal>
  );
};

export default AddNewStudentToInstitute;
