import ThinArrowButton from "@/assets/svgs/ThinArrowButton.svg?react";
import { useLanguage } from "@/shared/localization/useLanguage";
import { Link } from "react-router";

type ArrowProps = {
  to: string;
  buttonText: string;
};

function GhostButton({ buttonText, to }: ArrowProps) {
  const { lang } = useLanguage();

  return (
    <Link
      to={to}
      className="group inline-flex max-sm:text-sm items-center cursor-pointer text-secondary hover:text-secondary/90"
    >
      <span className="relative me-2 border-b-1 p-0.5 border-secondary">
        {buttonText}
      </span>

      <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">
        <ThinArrowButton className={`${lang === "en" ? "rotate-180" : ""}`} />
      </span>
    </Link>
  );
}

export default GhostButton;
