type defaultButtonPropsTypes = {
  text: string;
  type: "submit" | "reset" | undefined;
  moreStyle?: string;
};
const DefaultButton = ({ text, type, moreStyle }: defaultButtonPropsTypes) => {
  return (
    <button
      type={type}
      className={`${moreStyle} bg-gradient-to-r cursor-pointer bg-secondary text-white mx-12 px-4 py-2 rounded-lg shadow-md hover:to-secondary-light transition`}
    >
      {text}
    </button>
  );
};

export default DefaultButton;
