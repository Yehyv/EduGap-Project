import { lazy, Suspense } from "react";
import SectionTitleWithContent from "@/shared/components/ui/SectionTitleWithContent";
import { useLanguage } from "@/shared/localization/useLanguage";
import ScrollToTop from "@/shared/utils/ScrollToTop";

const ReportIcon = lazy(() => import("@/assets/svgs/InsuranceIcon.svg?react"));
const ShieldIcon = lazy(() => import("@/assets/svgs/ShieldIcon.svg?react"));

// Reusable list section component
const InfoListSection = ({ title, items }) => (
  <div>
    <h6 className="font-bold text-lg">{title}</h6>
    <ul className="list-disc ps-8 text-[#575757]">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

// Card wrapper for list sections
const CardWrapper = ({ children }) => (
  <div className="flex flex-col gap-2 bg-[#F3FBFF] text-[#575757] rounded-lg border border-[#CDCDCD] py-4 px-3 my-3">
    {children}
  </div>
);

// Reusable paragraph with heading
const ParagraphSection = ({ heading, text }) => (
  <div className="mb-4">
    {heading && <h4 className="text-secondary mb-1">{heading}</h4>}
    <p className="text-[#575757]">{text}</p>
  </div>
);

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#F3FBFF] min-h-screen">
      <ScrollToTop />

      {/* Header */}
      <header className="flex flex-col items-center gap-4 mt-10 mb-5 px-5 text-center">
        <div className="w-15 h-15 bg-[#D5F0FF] rounded-full flex items-center justify-center">
          <Suspense
            fallback={
              <span className="w-10 h-10 bg-secondary/50 animate-pulse rounded-full" />
            }
          >
            <ReportIcon className="w-8 h-8" aria-hidden="true" />
          </Suspense>
        </div>

        <h2 className="text-2xl font-bold">{t("privacy_policy_title")}</h2>
        <p className="text-[#575757]">{t("privacy_policy_platform")}</p>
        <p className="text-[#575757] text-sm">
          {t("privacy_policy_effective_date")}
        </p>
      </header>

      {/* Content */}
      <main className="container mx-auto px-5">
        <div className="bg-white md:p-10 p-5 rounded-xl flex flex-col gap-8">
          {/* Introduction */}
          <SectionTitleWithContent
            title={t("introduction_title")}
            paragraphText={t("introduction_paragraph")}
          />

          {/* Information We Collect */}
          <SectionTitleWithContent title={t("information_we_collect_title")}>
            <>
              <p className="text-[#575757] mb-3">
                {t("information_we_collect_intro")}
              </p>
              <CardWrapper>
                <InfoListSection
                  title={t("personal_information_title")}
                  items={t("personal_information_items")}
                />
                <InfoListSection
                  title={t("account_information_title")}
                  items={t("account_information_items")}
                />
                <InfoListSection
                  title={t("educational_data_title")}
                  items={t("educational_data_items")}
                />
                <InfoListSection
                  title={t("subscription_information_title")}
                  items={t("subscription_information_items")}
                />
                <InfoListSection
                  title={t("technical_usage_data_title")}
                  items={t("technical_usage_data_items")}
                />
                <InfoListSection
                  title={t("communication_data_title")}
                  items={t("communication_data_items")}
                />
              </CardWrapper>
            </>
          </SectionTitleWithContent>

          {/* How We Use Your Information */}
          <SectionTitleWithContent title={t("how_we_use_information_title")}>
            <div className="flex flex-col gap-3 ps-3">
              <p className="text-[#575757]">
                {t("how_we_use_information_intro")}
              </p>
              {[
                [
                  "how_we_use_account_management_title",
                  "how_we_use_account_management_text",
                ],
                [
                  "how_we_use_service_delivery_title",
                  "how_we_use_service_delivery_text",
                ],
                [
                  "how_we_use_certificate_issuance_title",
                  "how_we_use_certificate_issuance_text",
                ],
                [
                  "how_we_use_communication_title",
                  "how_we_use_communication_text",
                ],
                [
                  "how_we_use_platform_improvement_title",
                  "how_we_use_platform_improvement_text",
                ],
                ["how_we_use_security_title", "how_we_use_security_text"],
                ["how_we_use_analytics_title", "how_we_use_analytics_text"],
              ].map(([headingKey, textKey], idx) => (
                <ParagraphSection
                  key={idx}
                  heading={t(headingKey)}
                  text={t(textKey)}
                />
              ))}
            </div>
          </SectionTitleWithContent>

          {/* Sharing and Disclosure */}
          <SectionTitleWithContent title={t("sharing_disclosure_title")}>
            <div className="flex flex-col gap-3 ps-3">
              <p className="text-[#575757]">{t("sharing_disclosure_intro")}</p>
              {[
                [
                  "sharing_educational_institutes_title",
                  "sharing_educational_institutes_text",
                ],
                [
                  "sharing_service_providers_title",
                  "sharing_service_providers_text",
                ],
                [
                  "sharing_legal_requirements_title",
                  "sharing_legal_requirements_text",
                ],
                [
                  "sharing_business_transfers_title",
                  "sharing_business_transfers_text",
                ],
                [
                  "sharing_aggregated_data_title",
                  "sharing_aggregated_data_text",
                ],
                ["sharing_with_consent_title", "sharing_with_consent_text"],
              ].map(([headingKey, textKey], idx) => (
                <ParagraphSection
                  key={idx}
                  heading={t(headingKey)}
                  text={t(textKey)}
                />
              ))}
            </div>
          </SectionTitleWithContent>

          {/* Data Storage & Security Measures */}
          <SectionTitleWithContent title={t("data_storage_security_title")}>
            <>
              <p className="text-[#575757]">
                {t("data_storage_security_intro")}
              </p>
              <CardWrapper>
                {[
                  [
                    "data_storage_encryption_title",
                    "data_storage_encryption_text",
                  ],
                  [
                    "data_storage_access_controls_title",
                    "data_storage_access_controls_text",
                  ],
                  [
                    "data_storage_infrastructure_security_title",
                    "data_storage_infrastructure_security_text",
                  ],
                  [
                    "data_storage_authentication_title",
                    "data_storage_authentication_text",
                  ],
                  ["data_storage_backups_title", "data_storage_backups_text"],
                  [
                    "data_storage_incident_response_title",
                    "data_storage_incident_response_text",
                  ],
                ].map(([headingKey, textKey], idx) => (
                  <ParagraphSection
                    key={idx}
                    heading={t(headingKey)}
                    text={t(textKey)}
                  />
                ))}
              </CardWrapper>
              <p className="text-[#575757]">
                {t("data_storage_user_role_text")}
              </p>
            </>
          </SectionTitleWithContent>

          {/* Cookies & Tracking */}
          <SectionTitleWithContent title={t("cookies_tracking_title")}>
            <>
              <p className="text-[#575757] mb-3">
                {t("cookies_tracking_intro")}
              </p>
              {[
                [
                  "cookies_tracking_what_are_cookies_title",
                  "cookies_tracking_what_are_cookies_text",
                ],
                [
                  "cookies_tracking_types_title",
                  [
                    t("cookies_tracking_types_text_essential"),
                    t("cookies_tracking_types_text_performance"),
                    t("cookies_tracking_types_text_functionality"),
                    t("cookies_tracking_types_text_targeting"),
                  ],
                ],
                [
                  "cookies_tracking_analytics_title",
                  "cookies_tracking_analytics_text",
                ],
                [
                  "cookies_tracking_manage_title",
                  "cookies_tracking_manage_text",
                ],
              ].map(([headingKey, content], idx) => (
                <div key={idx} className="mb-4">
                  <h4 className="mb-1">{t(headingKey)}</h4>
                  {Array.isArray(content) ? (
                    <ul className="list-disc ps-6 text-[#575757]">
                      {content.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#575757]">{content}</p>
                  )}
                </div>
              ))}
            </>
          </SectionTitleWithContent>

          {/* User Rights */}
          <SectionTitleWithContent title={t("user_rights_title")}>
            <>
              <p className="text-[#575757]">{t("user_rights_intro")}</p>
              {[
                ["user_rights_access_title", "user_rights_access_text"],
                [
                  "user_rights_rectification_title",
                  "user_rights_rectification_text",
                ],
                ["user_rights_deletion_title", "user_rights_deletion_text"],
                [
                  "user_rights_portability_title",
                  "user_rights_portability_text",
                ],
                ["user_rights_restrict_title", "user_rights_restrict_text"],
                ["user_rights_object_title", "user_rights_object_text"],
                [
                  "user_rights_withdraw_consent_title",
                  "user_rights_withdraw_consent_text",
                ],
              ].map(([headingKey, textKey], idx) => (
                <div
                  key={idx}
                  className="bg-[#F4FBFF] rounded-lg border-s-4 border-secondary py-5 px-3 my-4"
                >
                  <h4>{t(headingKey)}</h4>
                  <p className="text-[#575757]">{t(textKey)}</p>
                </div>
              ))}
            </>
          </SectionTitleWithContent>

          {/* Retention Policy */}
          <SectionTitleWithContent title={t("retention_policy_title")}>
            <>
              <p className="text-[#575757]">{t("retention_policy_intro")}</p>
              <CardWrapper>
                {[
                  [
                    "retention_policy_active_accounts_title",
                    "retention_policy_active_accounts_text",
                  ],
                  [
                    "retention_policy_account_deletion_title",
                    "retention_policy_account_deletion_text",
                  ],
                  [
                    "retention_policy_certificates_title",
                    "retention_policy_certificates_text",
                  ],
                  [
                    "retention_policy_transaction_records_title",
                    "retention_policy_transaction_records_text",
                  ],
                  [
                    "retention_policy_legal_requirements_title",
                    "retention_policy_legal_requirements_text",
                  ],
                  [
                    "retention_policy_anonymized_data_title",
                    "retention_policy_anonymized_data_text",
                  ],
                ].map(([headingKey, textKey], idx) => (
                  <ParagraphSection
                    key={idx}
                    heading={t(headingKey)}
                    text={t(textKey)}
                  />
                ))}
              </CardWrapper>
              <p className="text-[#575757]">{t("retention_policy_note")}</p>
            </>
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

          <div className="center flex-col bg-gradient-to-r text-center p-7 md:px-15 gap-3 from-secondary to-secondary-dark text-white rounded-lg shadow-md">
            <ShieldIcon />
            <h4 className="text-white">{t("privacy_banner_title")}</h4>
            <p>{t("privacy_banner_text")}</p>
          </div>
        </div>
        <div className="text-center text-[#575757] py-10">
          <p>{t("privacy_footer_text")}</p>
          <p>{t("privacy_footer_updated")}</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
