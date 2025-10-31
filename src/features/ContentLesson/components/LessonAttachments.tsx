import { Suspense, lazy } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";

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

  return (
    <div className="min-h-[300px]">
      {/* Section Title */}
      <h4 className="mb-0">{t("attachments")}</h4>
      <Suspense fallback={null}>
        <TitleLine className="w-22" />
      </Suspense>

      {/* If files exist */}
      {hasFiles ? (
        dummyFiles.map(({ name, size }, i) => (
          <div key={i} className="mb-5">
            <div className="flex gap-4 border border-[#D6D6D6] hover:border-primary transition rounded-xl px-4 py-3 items-center">
              <AttachmentIcon className="text-primary" />
              <div className="w-full">
                <p className="font-medium">{name}</p>
                <p className="text-[#797979] text-sm">{size}</p>
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
