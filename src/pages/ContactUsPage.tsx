import { TextField } from "@/shared/components";
import TextareaField from "@/shared/components/forms/TextareaField";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { Formik, Form } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Clock,
  Send,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import contactBgImage from "@/assets/imgs/contactUsImage.jpg";
import { useLanguage } from "@/shared/localization/useLanguage";
import ScrollToTop from "@/shared/utils/ScrollToTop";

interface ContactFormValues {
  user_type: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialValues: ContactFormValues = {
  user_type: "",
  full_name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const validationSchema = Yup.object({
  user_type: Yup.string().required("Please select a user type"),
  full_name: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string().optional(),
  subject: Yup.string().required("Subject is required"),
  message: Yup.string()
    .min(10, "Message must be at least 10 characters")
    .required("Message is required"),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const ContactUsPage = () => {
  const { t } = useLanguage();

  const userTypeOptions = [
    { label: t("student"), value: "student" },
    { label: t("partner_institute"), value: "partner" },
    { label: t("employer"), value: "employer" },
    { label: t("other"), value: "other" },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: t("email"),
      value: "support@edugap.com",
      subtext: t("email_subtext"),
    },
    {
      icon: Phone,
      title: t("phone"),
      value: "+1 (555) 123-4567",
      subtext: t("phone_subtext"),
    },
    {
      icon: Clock,
      title: t("support_hours"),
      value: t("support_value"),
      subtext: t("support_subtext"),
    },
  ];

  const handleSubmit = (
    values: ContactFormValues,
    helpers: FormikHelpers<ContactFormValues>,
  ): void => {
    console.log(values);
    setTimeout(() => {
      helpers.setSubmitting(false);
      helpers.resetForm();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <section className="relative w-full h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${contactBgImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/10 to-gray-900/80" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-4"
          >
            <MessageSquare className="text-white w-8 h-8" />
            <span className="text-white/70 uppercase tracking-widest text-sm font-medium">
              {t("edugap_support")}
            </span>
          </motion.div>

          <motion.h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t("contact_us")}
          </motion.h1>

          <motion.p className="text-white/80 text-lg max-w-xl">
            {t("contact_description")}
          </motion.p>

          <motion.div className="absolute bottom-6">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="text-white/60 w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <motion.div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">
              {t("send_us_message")}
            </h3>

            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              {t("form_description")}
            </p>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-5">
                  <DropdownMenu
                    label={t("select_user_type")}
                    name="user_type"
                    options={userTypeOptions}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextField
                      label={t("full_name")}
                      name="full_name"
                      type="text"
                      required
                      placeholder={t("enter_full_name")}
                    />

                    <TextField
                      label={t("email_address")}
                      name="email"
                      type="email"
                      required
                      placeholder={t("email_placeholder")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextField
                      label={t("phone_number")}
                      name="phone"
                      type="tel"
                      placeholder={t("enter_phone")}
                    />

                    <TextField
                      label={t("subject")}
                      name="subject"
                      type="text"
                      required
                      placeholder={t("subject_placeholder")}
                    />
                  </div>

                  <TextareaField
                    name="message"
                    label={t("message")}
                    placeholder={t("message_placeholder")}
                  />

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-medium py-3 px-6 rounded-xl transition-opacity disabled:opacity-60"
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
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t("send_message")}
                      </>
                    )}
                  </motion.button>
                </Form>
              )}
            </Formik>
          </motion.div>

          <motion.div className="lg:w-80 flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                {t("get_in_touch")}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed">
                {t("contact_side_description")}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {contactInfo.map(({ icon: Icon, title, value, subtext }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm">
                      {title}
                    </h5>
                    <p className="text-gray-700 text-sm mt-0.5">{value}</p>
                    <span className="text-gray-400 text-xs">{subtext}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
