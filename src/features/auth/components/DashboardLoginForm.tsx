import { useState } from "react";
import { Formik, Form } from "formik";
import { TextField, GradientButton } from "@/shared/components";
import type { LoginFormValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";
import { motion } from "framer-motion";
import useDashboardLogin from "../hooks/useDashboardLogin";

const DashboardLoginForm = () => {
  const { handleSubmit, initialValues, validationSchema, isLoading } =
    useDashboardLogin();
  const { t } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="w-full"
    >
      <Formik<LoginFormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="flex flex-col gap-4 max-w-sm mx-auto w-full">
          {/* Username */}
          <motion.div variants={itemVariants}>
            <TextField
              label={t("username")}
              name="username"
              type="text"
              placeholder={t("username")}
            />
          </motion.div>

          {/* Password with eye */}
          <motion.div variants={itemVariants} className="relative">
            <TextField
              label={t("passowrd")}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passowrd")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="
                absolute
                right-3
                top-[38px]
                cursor-pointer
                text-gray-500
                select-none
              "
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants}>
            <GradientButton
              text={t("login")}
              type="submit"
              moreStyle="mt-5 w-full mx-auto"
              isLoading={isLoading}
            />
          </motion.div>
        </Form>
      </Formik>
    </motion.div>
  );
};

export default DashboardLoginForm;
