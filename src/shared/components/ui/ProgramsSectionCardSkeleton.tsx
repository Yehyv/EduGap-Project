const ProgramsSectionCardSkeleton = () => {
  return (
    <div className="bg-white flex rounded-2xl shadow-custom overflow-hidden my-5 mx-1 animate-pulse min-h-[220px]">
      {/* Left image skeleton */}
      <div className="w-1/2 relative bg-gray-200">
        <div className="w-full h-40 bg-gray-200"></div>
        <div className="absolute start-2 bottom-2 bg-gray-300 rounded-lg px-3 py-1 text-sm w-20 h-6"></div>
      </div>

      {/* Right content skeleton */}
      <div className="w-full p-4 flex flex-col">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
        {/* Description lines */}
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        {/* Button skeleton */}
        <div className="h-8 bg-gray-200 rounded w-24 self-end mt-5"></div>
      </div>
    </div>
  );
};

export default ProgramsSectionCardSkeleton;
