import { useState } from "react";
import { Formik, Form } from "formik";
import { TextField, GradientButton } from "@/shared/components";
import type { LoginFormValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";
import { motion } from "framer-motion";
import useDashboardLogin from "../hooks/useDashboardLogin";
import { User, Lock, Eye, EyeOff } from "lucide-react";

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
          <motion.div variants={itemVariants} className="relative">
            <User
              size={16}
              className="absolute start-3 top-[38px] text-gray-400 pointer-events-none z-10"
            />
            <TextField
              label={t("username")}
              name="username"
              type="text"
              placeholder={t("username")}
              moreStyle="ps-9"
            />
          </motion.div>

          {/* Password with eye */}
          <motion.div variants={itemVariants} className="relative">
            <Lock
              size={16}
              className="absolute start-3 top-[38px] text-gray-400 pointer-events-none z-10"
            />
            <TextField
              label={t("passowrd")}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passowrd")}
              moreStyle="ps-9 pe-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="
                absolute
                end-3
                top-[38px]
                cursor-pointer
                text-gray-400
                hover:text-gray-600
                transition-colors
                duration-150
                select-none
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-1
                focus-visible:ring-blue-400
                rounded
              "
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
