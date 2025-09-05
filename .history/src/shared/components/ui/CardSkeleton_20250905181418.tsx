export default function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl  shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="h-40 w-full bg-gray-200 rounded-lg mb-4"></div>
      {/* Title */}
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        {/* Subtitle */}
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
        {/* Subtitle */}
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        {/* Button */}
        <div className="h-8 bg-gray-200 rounded w-1/2 m-auto"></div>
      </div>
    </div>
  );
}
