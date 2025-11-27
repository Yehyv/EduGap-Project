import { Link } from "react-router-dom";
import SmoothLazy from "../SmoothLazy";
import { useLanguage } from "@/shared/localization/useLanguage";
const ReturnIcon = SmoothLazy(
  () => import("@/assets/svgs/ReturnIcon.svg?react"),
  "w-7 h-7"
);
const BackButton = () => {
  const { lang } = useLanguage();

  return (
    <>
      <Link
        to={"/userHome"}
        className={`inline-block cursor-pointer ${
          lang === "ar" ? "" : "rotate-180"
        }`}
      >
        <ReturnIcon />
      </Link>
    </>
  );
};

export default BackButton;
