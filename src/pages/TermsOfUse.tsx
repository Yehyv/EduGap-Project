import SectionTitleWithContent from "@/shared/components/ui/SectionTitleWithContent";
import { useLanguage } from "@/shared/localization/useLanguage";
import ScrollToTop from "@/shared/utils/ScrollToTop";
import { lazy, Suspense } from "react";

const ReportIcon = lazy(() => import("@/assets/svgs/ReportIcon.svg?react"));

const TermsOfUse = () => {
  const { t } = useLanguage();

  // === 1) Static list mapping instead of repeating components === //
  const simpleSections = [
    { title: t("introduction_title"), text: t("introduction_text") },
    { title: t("account_title"), text: t("account_text") },
    { title: t("payments_title"), text: t("payments_text") },
    { title: t("course_access_title"), text: t("course_access_text") },
    { title: t("termination_title"), text: t("termination_text") },
  ];

  // === 2) User responsibilities list === //
  const userResponsibilities = [
    t("user_resp_1"),
    t("user_resp_2"),
    t("user_resp_3"),
    t("user_resp_4"),
    t("user_resp_5"),
    t("user_resp_6"),
  ];

  // === 3) Prohibited activities list === //
  const prohibitedItems = [
    t("prohibited_1"),
    t("prohibited_2"),
    t("prohibited_3"),
    t("prohibited_4"),
    t("prohibited_5"),
    t("prohibited_6"),
    t("prohibited_7"),
    t("prohibited_8"),
    t("prohibited_9"),
    t("prohibited_10"),
  ];

  return (
    <div className="bg-[#F3FBFF]">
      <ScrollToTop />

      {/* Header */}
      <div className="flex-col center gap-4 mt-10 mb-5 px-5">
        <div className="w-15 h-15 bg-[#D5F0FF] rounded-full center">
          <Suspense
            fallback={
              <span className="w-10 h-10 bg-secondary/50 animate-pulse rounded-full" />
            }
          >
            <ReportIcon className="w-8 h-8" />
          </Suspense>
        </div>

        <h2>{t("terms_title")}</h2>
        <p>{t("terms_subtitle")}</p>
      </div>

      {/* Content */}
      <div className="container">
        <div className="bg-white md:p-10 p-5 rounded-xl flex flex-col gap-8">
          {/* Sections with simple paragraphText */}
          {simpleSections.map(({ title, text }) => (
            <SectionTitleWithContent
              key={title}
              title={title}
              paragraphText={text}
            />
          ))}

          {/* User Responsibilities */}
          <SectionTitleWithContent title={t("user_resp_title")}>
            <div className="text-[#575757]">
              <p>{t("user_resp_intro")}</p>

              <ul className="list-disc ps-6">
                {userResponsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <p>{t("user_resp_outro")}</p>
            </div>
          </SectionTitleWithContent>

          {/* Prohibited Activities */}
          <SectionTitleWithContent title={t("prohibited_title")}>
            <div className="text-[#575757]">
              <p>{t("prohibited_intro")}</p>

              <ul className="list-disc ps-6">
                {prohibitedItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <p>{t("prohibited_outro")}</p>
            </div>
          </SectionTitleWithContent>

          {/* Contact */}
          <SectionTitleWithContent title={t("contact_title")}>
            <div className="text-[#575757]">
              <p>{t("contact_intro")}</p>

              <div className="bg-[#F3FBFF] border border-[#CDCDCD] rounded-lg min-h-[100px] p-5 text-lg">
                <div>
                  <span className="font-bold text-black">
                    {t("contact_email_label")}:
                  </span>{" "}
                  <span className="break-words">
                    support@edugapplatform.com
                  </span>
                </div>

                <div>
                  <span className="font-bold text-black">
                    {t("contact_phone_label")}:
                  </span>{" "}
                  <span>0125 562 5897</span>
                </div>
              </div>

              <p>{t("contact_outro")}</p>
            </div>
          </SectionTitleWithContent>

          <div className="h-[1px] bg-[#A6A6A6]" />

          <h6 className="text-center text-[#575757] mb-5">
            {t("last_updated")}
          </h6>
        </div>

        <h6 className="text-center text-[#575757] my-10">
          {t("terms_footer")}
        </h6>
      </div>
    </div>
  );
};

export default TermsOfUse;
