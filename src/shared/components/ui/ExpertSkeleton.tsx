const ExpertSkeleton = () => {
  return (
    <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl w-40">
      <div className="w-40 h-40 rounded-full bg-gray-200 animate-pulse"></div>

      <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>

      <div className="h-3 w-32 rounded bg-gray-200 animate-pulse"></div>
    </div>
  );
};

export default ExpertSkeleton;
