import LessonHeader from "@/features/ContentLesson/components/LessonHeader";
import { useLanguage } from "@/shared/localization/useLanguage";
import FavStarIcon from "@/assets/svgs/FavStarIcon.svg?react";
import { getContentMaterials } from "@/features/ContentLesson/services/lessonsApis";
import type { ContentMaterialsTypeResponse } from "@/shared/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Loader } from "@/shared/components";
import ErrorMessage from "@/shared/components/ErrorMessage";
import { lazy } from "react";
import { motion } from "framer-motion"; // <--- import framer motion

const AttachmentIcon = lazy(
  () => import("@/assets/svgs/AttachmentIcon.svg?react")
);
const DownloadIcon = lazy(() => import("@/assets/svgs/DownloadIcon.svg?react"));

const CourseMaterials = () => {
  const { t } = useLanguage();
  const { courseId } = useParams();

  const { data, isLoading, error } = useQuery<ContentMaterialsTypeResponse>({
    queryKey: ["getContentMaterials", courseId],
    queryFn: () => getContentMaterials(courseId ?? ""),
  });

  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorMessage
        message={error?.message ?? "Error while fetching materials"}
      />
    );

  const hasFiles = data && data.length > 0;

  // Framer motion variants
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="container mb-20">
      <LessonHeader />
      <div className="container border border-[#9E9C9C] rounded-lg p-0 mt-5">
        <h4 className="border-b flex items-center gap-2 border-[#9E9C9C] p-5">
          <FavStarIcon />
          <span>{t("important_lessons")}</span>
        </h4>

        <motion.div
          className="max-md:px-3 px-10 py-5 min-h-[70vh]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {hasFiles ? (
            data!.map((lessonItem) => (
              <motion.div
                key={lessonItem.lesson.id}
                className="mb-8"
                variants={itemVariants}
              >
                {/* Lesson Name */}
                <h5 className="text-lg font-semibold mb-3">
                  {lessonItem.lesson.name}
                </h5>

                {/* Materials */}
                {lessonItem.materials.length > 0 ? (
                  lessonItem.materials.map((material) => (
                    <motion.div
                      key={material.id}
                      className="flex gap-4 border border-[#D6D6D6] hover:border-primary transition rounded-xl px-4 py-3 items-center mb-3"
                      variants={itemVariants}
                    >
                      <AttachmentIcon className="text-primary" />
                      <div className="w-full">
                        <p className="font-medium">
                          {material.title || t("untitled")} .{" "}
                          {material.materialType?.name || ""}
                        </p>
                        <p className="text-gray-400">
                          {material.description || ""}
                        </p>
                      </div>
                      <a
                        href={material.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadIcon className="cursor-pointer hover:scale-105 transition" />
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">
                    {t("no_attachments_available")}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 bg-gray-100 py-4 rounded-lg mt-4 text-sm">
              {t("no_attachments_available")}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CourseMaterials;
