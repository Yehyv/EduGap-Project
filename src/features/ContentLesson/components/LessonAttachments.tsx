import { Suspense, lazy } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { lessonMaterialsTypes } from "@/shared/types/sharedTypes";
import { getLessonsMaterials } from "../services/lessonsApis";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import SliderErrorFallback from "@/shared/utils/SliderErrorFallback";

const AttachmentIcon = lazy(
  () => import("@/assets/svgs/AttachmentIcon.svg?react")
);
const DownloadIcon = lazy(() => import("@/assets/svgs/DownloadIcon.svg?react"));
const TitleLine = lazy(() => import("@/assets/svgs/TitileLine.svg?react"));

const LessonAttachments = () => {
  const { t } = useLanguage();
  const { lessonId } = useParams();
  const { data, isLoading, error } = useQuery<lessonMaterialsTypes[]>({
    queryKey: ["getLessonMaterials", lessonId],
    queryFn: () => getLessonsMaterials(lessonId ?? ""),
  });

  const hasFiles = data != undefined && data?.length > 0;
  const materialsData = data?.[0]?.materials;

  if (error)
    return (
      <SliderErrorFallback
        componentTitle={
          error?.message ?? "Error while fetching lesson materials"
        }
      />
    );

  if (isLoading) return <CircleLoader />;

  return (
    <div className="min-h-[300px]">
      {/* Section Title */}
      <h4 className="mb-0">{t("attachments")}</h4>
      <Suspense fallback={null}>
        <TitleLine className="w-22" />
      </Suspense>

      {/* If files exist */}
      {hasFiles ? (
        materialsData?.map((file, i) => (
          <div key={i} className="mb-5">
            <div className="flex gap-4 border border-[#D6D6D6] hover:border-primary transition rounded-xl px-4 py-3 items-center">
              <AttachmentIcon className="text-primary" />
              <div className="w-full">
                <p className="font-medium">
                  {file?.title}.{file?.materialType?.name}
                </p>
                <p className="text-gray-400">{file?.description}</p>
              </div>

              {/* Open PDF in new tab */}
              {file?.file && (
                <a
                  href={file.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:scale-105 transition"
                >
                  <DownloadIcon />
                </a>
              )}
            </div>
          </div>
        ))
      ) : (
        // No files message
        <div className="text-center text-gray-500 bg-gray-100 py-4 rounded-lg mt-4 text-sm">
          {t("no_attachments_available")}
        </div>
      )}
    </div>
  );
};

export default LessonAttachments;
