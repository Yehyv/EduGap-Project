import { useLanguage } from "@/shared/localization/useLanguage";

const ActiveOrInactiveButton = ({ isActive }: { isActive: boolean }) => {
  const { t } = useLanguage();
  return (
    <button
      className={`px-6 py-1 rounded-full border font-medium text-sm relative ${
        isActive
          ? "border-green-500 text-green-500"
          : "border-red-500 text-red-500"
      }`}
    >
      {isActive ? t("active") : t("inactive")}
      <span
        className={`absolute w-1 h-1 rounded-full start-3 top-1/2 -translate-y-1/2 inline-block ${
          isActive ? "bg-green-500" : "bg-red-500"
        }`}
      />
    </button>
  );
};

export default ActiveOrInactiveButton;
