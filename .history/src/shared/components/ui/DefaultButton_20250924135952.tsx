type defaultButtonPropsTypes = {
  text: string;
  type: "submit" | "reset" | "button" | undefined;
  moreStyle?: string;
  onClick: () => void;
  disabled?: boolean;
};
const DefaultButton = ({
  text,
  type,
  moreStyle,
  onClick,
  disabled,
}: defaultButtonPropsTypes) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={`${moreStyle} bg-gradient-to-r cursor-pointer bg-secondary text-white  px-4 py-2 rounded-lg shadow-md hover:to-secondary-dark transition`}
    >
      {text}
    </button>
  );
};

export default DefaultButton;
