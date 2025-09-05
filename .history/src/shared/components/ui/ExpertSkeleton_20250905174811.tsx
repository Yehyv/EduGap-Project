const ExpertSkeleton = () => {
  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-sm w-40">
      <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>

      <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>

      <div className="h-3 w-32 rounded bg-gray-200 animate-pulse"></div>
    </div>
  );
};

export default ExpertSkeleton;
