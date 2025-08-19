type defaultButtonPropsTypes = {
  text: string;
  type: "submit" | "reset" | undefined;
  moreStyle?: string;
  onClick: () => void;
};
const DefaultButton = ({
  text,
  type,
  moreStyle,
  onClick,
}: defaultButtonPropsTypes) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`${moreStyle} bg-gradient-to-r cursor-pointer bg-secondary text-white  px-4 py-2 rounded-lg shadow-md hover:to-secondary transition`}
    >
      {text}
    </button>
  );
};

export default DefaultButton;
