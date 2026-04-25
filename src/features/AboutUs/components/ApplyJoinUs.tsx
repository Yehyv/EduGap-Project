import { TextField } from "@/shared/components";
import TextareaField from "@/shared/components/forms/TextareaField";
import { Formik, Form } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { createApplyMessage } from "@/features/Dashboard/services/dashboardApis";
import { toast } from "react-toastify";

// ── Types ────────────────────────────────────────────────────────────────────
interface ApplyFormValues {
  institute_name: string;
  contact_person: string;
  email: string;
  phone: string;
  message: string;
}

// ── Static config ────────────────────────────────────────────────────────────
const initialValues: ApplyFormValues = {
  institute_name: "",
  contact_person: "",
  email: "",
  phone: "",
  message: "",
};

const ApplyJoinUs = () => {
  const { t } = useLanguage();
  const validationSchema = Yup.object({
    institute_name: Yup.string()
      .min(2, t("institute_name_min"))
      .required(t("institute_name_required")),
    contact_person: Yup.string()
      .min(2, t("contact_person_min"))
      .required(t("contact_person_required")),
    email: Yup.string().email(t("email_invalid")).required(t("email_required")),
    phone: Yup.string()
      .matches(/^[+\d\s\-()]{7,20}$/, t("phone_invalid"))
      .required(t("phone_required")),
    message: Yup.string()
      .min(6, t("min_6_chars"))
      .required(t("required_message")),
  });

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    values: ApplyFormValues,
    helpers: FormikHelpers<ApplyFormValues>,
  ) => {
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await createApplyMessage({
        institute_name: values.institute_name,
        contact_person: values.contact_person,
        email_address: values.email, // form: email → API: email_address
        phone_number: values.phone, // form: phone → API: phone_number
        about_your_institute: values.message, // form: message → API: about_your_institute
      });
      setSubmitStatus("success");
      toast.success(t("message_sent_successfully"));
      helpers.resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("something_wrong");
      setErrorMessage(message);
      setSubmitStatus("error");
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <section className="py-10 px-4" id="apply">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-secondary/70 bg-secondary/8 border border-secondary/15 rounded-full px-4 py-1.5 mb-4">
            {t("partner_with_us")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {t("apply_to_join")} <span className="text-secondary">EduGap</span>
          </h2>
          <p className="text-gray-500 text-base max-w-md leading-relaxed">
            {t("fill_form_description")}
          </p>
        </motion.div>

        {/* Status banners */}
        <AnimatePresence>
          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm">
                  {t("application_success")}
                </p>
                <p className="text-emerald-700 text-sm mt-0.5">
                  {t("team_review_48h")}
                </p>
              </div>
            </motion.div>
          )}

          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">
                  {t("submission_failed")}
                </p>
                <p className="text-red-700 text-sm mt-0.5">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form card */}
        <motion.div
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5">
                  <TextField
                    label={t("institute_name")}
                    name="institute_name"
                    type="text"
                    required
                    placeholder={t("institute_name_placeholder")}
                  />
                  <TextField
                    label={t("contact_person")}
                    name="contact_person"
                    type="text"
                    required
                    placeholder={t("contact_person_placeholder")}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      label={t("email_address")}
                      name="email"
                      type="email"
                      required
                      placeholder={t("email_placeholder")}
                    />
                    <TextField
                      label={t("phone_number")}
                      name="phone"
                      type="tel"
                      required
                      placeholder={t("phone_placeholder")}
                    />
                  </div>
                </div>

                <TextareaField
                  name="message"
                  label={t("about_institute")}
                  placeholder={t("message_placeholder")}
                />

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-medium py-3 px-6 rounded-xl transition-opacity disabled:opacity-60 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          ease: "linear",
                        }}
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      {t("submitting")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t("submit_application")}
                    </>
                  )}
                </motion.button>
              </Form>
            )}
          </Formik>
        </motion.div>
      </div>
    </section>
  );
};

export default ApplyJoinUs;
