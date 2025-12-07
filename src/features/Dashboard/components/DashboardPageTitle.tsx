import ButtonLoader from "@/shared/components/ButtonLoader";

const DashboardPageTitle = ({
  text,
  button,
  buttonText,
  isLoading,
}: {
  text: string;
  button?: boolean;
  isLoading?: boolean;
  buttonText?: React.ReactNode;
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="mb-5">{text}</h1>
      {button && (
        <button
          type={"button"}
          className={`bg-gradient-to-r cursor-pointer  from-secondary to-secondary-dark text-white px-4 rounded-xl shadow-md hover:to-secondary transition`}
        >
          {isLoading ? <ButtonLoader /> : buttonText}
        </button>
      )}
    </div>
  );
};

export default DashboardPageTitle;
