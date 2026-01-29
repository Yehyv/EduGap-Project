import PlusBlueIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import AssignContentToCourse from "@/features/Dashboard/components/AssignContentToCourse";
import { useState } from "react";
import DeleteButton from "./DeleteButton";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getContentsForCourses,
  unassignTraningCourseToCourse,
} from "../services/dashboardApis";

const ContentsInCourse = () => {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { courseId } = useParams();
  const { data } = useQuery({
    queryKey: ["getContentsForCourses"],
    queryFn: () => getContentsForCourses(courseId ?? ""),
  });
  return (
    <>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setReviewModalOpen(true)}
          className="center text-secondary font-bold"
        >
          <span>اضافة دورة تدريبية جديدة</span>
          <PlusBlueIcon className="h-7" />
        </button>
        <p className="text-[#9B9393]">
          Training courses for the course ({data?.data?.length})
        </p>
      </div>
      {data?.data.map((c, index) => (
        <div className="bg-white p-5 rounded-lg mb-4 flex justify-between">
          <div>
            <span>{index + 1} - </span>
            <Link to={`/dashboard/contents/${c.id}`}>{c.name}</Link>
          </div>
          <div className="center gap-2">
            <Link to={`/dashboard/contents/edit/${c.id}`}>
              <EditIcon />
            </Link>
            <DeleteButton
              deleteApi={() => unassignTraningCourseToCourse(courseId, c.id)}
              errorMessage="Error while unassign training course from learning path"
              successMessage="Training course unassigned successfully."
              refetchFunction="getContentsForCourses"
            />
          </div>
        </div>
      ))}{" "}
      <AssignContentToCourse
        reviewModalOpen={reviewModalOpen}
        setReviewModalOpen={setReviewModalOpen}
      />
    </>
  );
};

export default ContentsInCourse;
