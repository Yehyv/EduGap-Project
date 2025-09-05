const SliderErrorFallback = ({
  componentTitle,
}: {
  componentTitle: string;
}) => {
  return (
    <div className="h-40 flex items-center justify-center text-red-500 bg-red-50 rounded-md">
      Failed to load {componentTitle}
    </div>
  );
};

export default SliderErrorFallback;
