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

type Attachment = {
  name: string;
  size: string;
};

const dummyFiles: Attachment[] = [
  { name: "قالب استراتيجية التسويق بالذكاء الاصطناعي.pdf", size: "2.3 م ب" },
  { name: "قالب استراتيجية التسويق بالذكاء الاصطناعي.pdf", size: "2.3 م ب" },
  { name: "قالب استراتيجية التسويق بالذكاء الاصطناعي.pdf", size: "2.3 م ب" },
];

const LessonAttachments = () => {
  const { t } = useLanguage();

  const hasFiles = dummyFiles.length > 0;
  const { lessonId } = useParams();
  const { data, isLoading, error } = useQuery<lessonMaterialsTypes[]>({
    queryKey: ["getLessonMaterials", lessonId],
    queryFn: () => getLessonsMaterials(lessonId ?? ""),
  });

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
        data?.map((file, i) => (
          <div key={i} className="mb-5">
            <div className="flex gap-4 border border-[#D6D6D6] hover:border-primary transition rounded-xl px-4 py-3 items-center">
              <AttachmentIcon className="text-primary" />
              <div className="w-full">
                <p className="font-medium">
                  {file?.title}.{file?.materialType?.name}
                </p>
                <p className="text-gray-400">{file?.description}</p>
              </div>

              {/* download icon */}
              <DownloadIcon className="cursor-pointer hover:scale-105 transition" />
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
