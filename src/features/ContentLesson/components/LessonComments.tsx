import { Suspense, lazy } from "react";
import CommentsSection from "@/shared/components/ui/CommentsSections";
import { useLanguage } from "@/shared/localization/useLanguage";

const TitleLine = lazy(() => import("@/assets/svgs/TitileLine.svg?react"));

const LessonComments = () => {
  const { t } = useLanguage();

  return (
    <>
      <div className="mb-5">
        <h4 className="mb-0">{t("commentsTitle")}</h4>
        <Suspense fallback={null}>
          <TitleLine className="w-22" />
        </Suspense>
      </div>

      <CommentsSection />
    </>
  );
};

export default LessonComments;
