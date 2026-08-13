import PlusIcon from "@/assets/svgs/PlusBlueIcon.svg?react";
import EditIcon from "@/assets/svgs/EditDashboardIcon.svg?react";
import { useQuery } from "@tanstack/react-query";
import {
  getContentsForTrainingPath,
  unassignTraningCourseToLearningPath,
} from "../services/dashboardApis";
import { Link, useParams } from "react-router-dom";
import AddContentToLearningPath from "./AddContentToLearningPath";
import { useState } from "react";
import DeleteButton from "./DeleteButton";
import { useLanguage } from "@/shared/localization/useLanguage";

const ContentsInLearningPath = () => {
  const [openModal, setOpenModal] = useState(false);
  const { learningPathId } = useParams();
  const { t } = useLanguage();

  const { data } = useQuery({
    queryKey: ["getContentsForLearningPath"],
    queryFn: () => getContentsForTrainingPath(learningPathId ?? ""),
  });

  return (
    <>
      <div className="flex justify-between my-4">
        <button
          onClick={() => setOpenModal(true)}
          className="text-secondary font-bold"
        >
          {t("addNewTrainingCourse")}
          <PlusIcon className="inline-block h-8 mt-1" />
        </button>

        <p className="text-[#9B9393]">
          {t("trainingCoursesForTrack")} ({data?.data?.length})
        </p>
      </div>

      {data?.data.map((c, index) => (
        <div
          className="bg-white p-5 rounded-lg mb-4 flex justify-between"
          key={c.id}
        >
          <div>
            <span>{index + 1} - </span>

            <Link to={`/dashboard/contents/${c.id}`}>{c.name}</Link>
          </div>

          <div className="center gap-2">
            <Link to={`/dashboard/contents/edit/${c.id}`}>
              <EditIcon />
            </Link>

            <DeleteButton
              deleteApi={() =>
                unassignTraningCourseToLearningPath(learningPathId, c.id)
              }
              errorMessage={t("unassignTrainingCourseError")}
              successMessage={t("trainingCourseUnassignedSuccess")}
              refetchFunction="getContentsForLearningPath"
            />
          </div>
        </div>
      ))}

      <AddContentToLearningPath
        setReviewModalOpen={setOpenModal}
        reviewModalOpen={openModal}
      />
    </>
  );
};

export default ContentsInLearningPath;
