import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { createLesson } from "@/features/Dashboard/services/dashboardApis";
import AddOrEditLesson from "@/features/Dashboard/components/AddOrEditLesson";
import { useParams } from "react-router-dom";

const AddNewLesson = () => {
  const { topicId } = useParams();
  const initialValues = {
    topicId: topicId,
    lessonType: "",
    videoLink: "",
    image: "",
    translations: [
      { name: "", description: "", languageId: 1 },
      { name: "", description: "", languageId: 2 },
    ],
  };
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Lesson added successfully",
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong, please try again",
      });
    },
  });

  return (
    <>
      <h3 className="mb-4">Add New Lesson</h3>
      <AddOrEditLesson
        mutate={mutate}
        initialValues={initialValues}
        isPending={isPending}
      />
    </>
  );
};

export default AddNewLesson;
