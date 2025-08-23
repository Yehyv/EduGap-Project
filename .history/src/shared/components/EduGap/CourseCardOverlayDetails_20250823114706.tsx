<div
  className="
    absolute inset-0 z-10 bg-white/95 backdrop-blur-sm
    opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0
    transition-all duration-300
    p-4 flex flex-col
    pointer-events-auto
  "
>
  {/* Title & Instructor */}
  <div className="shrink-0">
    <h3
      title={course?.title}
      className="font-semibold line-clamp-1 text-secondary text-lg leading-tight mb-1"
    >
      {course?.title}
    </h3>
    <p className="text-sm font-medium text-gray-500">{course?.instructor}</p>
  </div>

  {/* Info Row */}
  <div className="flex gap-4 text-sm text-gray-600 shrink-0">
    <div>
      <TimeLeftIcon className="inline-block me-1" />
      <span>1 ساعة 50 دقيقة / 12 درس</span>
    </div>
    <div>
      <VolumeIcon className="!text-black inline-block me-2" />
      <span>عام</span>
    </div>
  </div>

  {/* Divider */}
  <div className="h-[1px] bg-gray-300 w-full shrink-0"></div>

  {/* What you'll learn */}
  <div className="flex-1 min-h-0">
    <h6 className="text-sm font-semibold mb-1">ماذا ستتعلم</h6>
    <TitileLine className="w-14 -mt-2" />
    <ul className="space-y-2 overflow-y-auto pr-1 text-sm text-gray-700 h-full">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="flex items-start gap-2">
          <CheckIcon className="mt-1 shrink-0" />
          <span className="line-clamp-2">
            تتعرف على أسس الذكاء الاصطناعي في التسويق، وتتعلم كيفية استخدام
            البيانات والتحليلات الذكية في تحسين استراتيجيات التسويق.
          </span>
        </li>
      ))}
    </ul>
  </div>
</div>;
