import { Formik, Form } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { TextField, GradientButton, LightButton } from "@/shared/components";
import useLogin from "../hooks/useLogin";
import type { LoginFormValues } from "../auth.types";
import { useLanguage } from "@/shared/localization/useLanguage";
import { motion } from "framer-motion";

const LoginForm = () => {
  const { handleSubmit, initialValues, validationSchema, isLoading } =
    useLogin();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
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
          <motion.div variants={itemVariants}>
            <TextField
              label={t("national_id")}
              name="username"
              type="username"
              placeholder={t("national_id")}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <TextField
              label={t("passowrd")}
              name="password"
              type="password"
              placeholder={t("passowrd")}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <GradientButton
              text={t("login")}
              type="submit"
              moreStyle="mt-5 w-full mx-auto"
              isLoading={isLoading}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link
              to={"/forgot-password"}
              className="text-[#767676] text-center block"
            >
              {t("forgot_password")}
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="sm:hidden">
            <LightButton
              text={t("continue_button")}
              onClick={() => navigate("/")}
            />
          </motion.div>
        </Form>
      </Formik>
    </motion.div>
  );
};

export default LoginForm;
