import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  editLesson,
  getLessonDetailsForDashboard,
} from "@/features/Dashboard/services/dashboardApis";
import AddOrEditLesson from "@/features/Dashboard/components/AddOrEditLesson";
import { useParams } from "react-router-dom";
import CircleLoader from "@/shared/components/ui/CircleLoader";

const EditLessonData = () => {
  const { topicId, lessonId } = useParams();
  /* ================= QUERY ================= */
  const { data, isLoading } = useQuery({
    queryKey: ["lessonDetailsForDashboard", lessonId],
    queryFn: () => getLessonDetailsForDashboard(lessonId ?? "", topicId ?? ""),
    enabled: !!lessonId,
  });

  const queryClient = useQueryClient();

  const initialValues = {
    topicId: topicId,
    lessonType: data?.data.lesson_type,
    videoLink: data?.data.video_link,
    image: data?.data.image,
    translations: [
      {
        name: data?.data.translations[0].name,
        description: data?.data.translations[0].description,
        languageId: 1,
      },
      {
        name: data?.data.translations[1]?.name,
        description: data?.data.translations[1]?.description,
        languageId: 2,
      },
    ],
  };
  /* ================= MUTATION ================= */
  const { mutate, isPending } = useMutation({
    mutationFn: editLesson,

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Lesson updated successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["lessonDetailsForDashboard"],
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
      <h3 className="mb-4">Edit Lesson</h3>
      {isLoading ? (
        <CircleLoader />
      ) : (
        <AddOrEditLesson
          mutate={mutate}
          initialValues={initialValues}
          isPending={isPending}
        />
      )}
    </>
  );
};

export default EditLessonData;
