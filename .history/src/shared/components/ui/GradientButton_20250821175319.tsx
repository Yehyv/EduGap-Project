type GradientButtonPropsTypes = {
  text: string;
  type: "submit" | "reset" | undefined;
  moreStyle: string;
};
const GradientButton = ({
  text,
  type,
  moreStyle,
}: GradientButtonPropsTypes) => {
  return (
    <button
      type={type}
      className={`${moreStyle} bg-gradient-to-r cursor-pointer from-secondary to-secondary-dark text-white mx-12 px-4 py-2 rounded-lg shadow-md hover:to-secondary transition`}
    >
      {text}
    </button>
  );
};

export default GradientButton;
