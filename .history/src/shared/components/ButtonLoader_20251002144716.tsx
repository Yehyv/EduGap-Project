const ButtonLoader = ({
  borderColor = "border-white",
}: {
  borderColor?: string;
}) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`w-6 h-6 ${borderColor} border-white border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default ButtonLoader;
