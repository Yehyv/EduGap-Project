import AddModal from "./AddModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { TextField } from "@/shared/components";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { phoneKeys } from "@/shared/utils/globals";
import {
  createStudent,
  createStudentToInstitute,
} from "../services/dashboardApis";

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

  phone: Yup.string().required("Phone number is required"),
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

  const { mutate, isPending } = useMutation({
    mutationFn: createStudentToInstitute,
    onSuccess: () => {
      Swal.fire("Success", "Student created successfully", "success");
      setReviewModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["getStudentsInInstitute"],
      });
    },
    onError: (err: any) => {
      setReviewModalOpen(false);

      const message = err?.response?.data?.message;

      Swal.fire(
        "Error",
        Array.isArray(message)
          ? message.join(", ")
          : message || "Something went wrong",
        "error",
      );
    },
  });

  const initialValues = {
    full_name: "",
    email: "",
    national_id: "",
    phone_key: "+20",
    phone: "",
    user_image: "",
    instituteId: instituteId,
  };

  return (
    <AddModal
      maxW="max-w-2xl"
      open={reviewModalOpen}
      onOpenChange={setReviewModalOpen}
      headerComponent={
        <Dialog.Title className="text-secondary text-xl">
          Add New Student
        </Dialog.Title>
      }
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={studentSchema}
        onSubmit={(values) => {
          const body = {
            ...values,
            instituteId: Number(instituteId),
          };

          mutate(body);
        }}
      >
        <Form className="">
          <div className="flex flex-col gap-4 max-h-[80vh] overflow-auto px-2 -mt-4 py-2">
            <div>
              <TextField
                label="Full Name"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                name="full_name"
                placeholder="Full Name"
              />
            </div>
            <div className="flex gap-3 ">
              <div className="w-[120px] max-sm:w-full">
                <DropdownMenu
                  label="Phone Key"
                  name="phone_key"
                  options={phoneKeys}
                />
              </div>
              <div className="w-full">
                <TextField
                  moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl bg-[#F9F8F8]"
                  label="Phone:"
                  name="phone"
                  type="text"
                  placeholder="phone number"
                />
              </div>
            </div>

            <div>
              <TextField
                label="Email"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                name="email"
                placeholder="Email"
              />
            </div>

            <div>
              <TextField
                label="National ID"
                moreStyle="!border-[#ACACAC] bg-[#F9F8F8]"
                name="national_id"
                placeholder="National ID"
                onlyNumbers
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-secondary text-white rounded-xl py-2 w-fit px-4 mt-6"
          >
            {isPending ? "Creating..." : "Save Student"}
          </button>
        </Form>
      </Formik>
    </AddModal>
  );
};

export default AddNewStudentToInstitute;
