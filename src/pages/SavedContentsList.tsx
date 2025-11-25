import SectionTitle from "@/shared/components/SectionTitle";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import { useLanguage } from "@/shared/localization/useLanguage";
import SavedContentsPagination from "@/features/SavedIrems/components/SavedContentsPagination";

const SavedContentsList = () => {
  const { t } = useLanguage();

  return (
    <div className="mb-5 mt-10 container">
      <ScrollToTop />
      <SectionTitle textTitle={t("saved_courses_title")} />

      <SavedContentsPagination />
    </div>
  );
};

export default SavedContentsList;
