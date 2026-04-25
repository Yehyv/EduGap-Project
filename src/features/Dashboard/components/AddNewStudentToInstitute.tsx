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
        title: "Success",
        text: "Student created successfully",
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
        title: "Error",
        text: Array.isArray(message)
          ? message.join(", ")
          : message || "Something went wrong, please try again",
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
          Add New Student
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
              {/* Full Name */}
              <div>
                <TextField
                  label="Full Name"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                  name="full_name"
                  placeholder="Enter full name"
                  autoComplete="name"
                />
              </div>
              <div>
                <TextField
                  label="Student Id"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                  name="studentId"
                  placeholder="Enter Student Id"
                  onlyNumbers
                />
              </div>

              <DropdownMenu
                label="Program"
                name="programId"
                options={handleProgramsData}
              />
              {/* Phone */}
              <div className="flex gap-3">
                <div className="w-[120px] shrink-0">
                  <DropdownMenu
                    label="Phone Key"
                    name="phone_key"
                    options={phoneKeys}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <TextField
                    moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
                    label="Phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    onlyNumbers
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <TextField
                  label="Email"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  autoComplete="email"
                />
              </div>

              {/* National ID */}
              <div>
                <TextField
                  label="National ID"
                  moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                  name="national_id"
                  placeholder="Enter 14-digit National ID"
                  onlyNumbers
                  maxLength={14}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl py-2 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !isValid || !dirty}
                className="bg-secondary hover:bg-secondary-dark text-white rounded-xl py-2 px-6 min-w-[140px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <ButtonLoader /> : "Save Student"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </AddModal>
  );
};

export default AddNewStudentToInstitute;
