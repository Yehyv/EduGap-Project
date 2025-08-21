const CourseCard = ({ course }) => {
  return (
    <div className="tw-bg-white tw-shadow-md tw-p-4 tw-rounded">
      <img
        src={course.image}
        alt={course.name}
        className="tw-w-full tw-h-40 tw-object-cover tw-rounded"
      />
      <h3 className="tw-mt-2 tw-text-lg tw-font-bold">{course.name}</h3>
      <p className="tw-text-sm tw-text-gray-500">{course.instructor}</p>
    </div>
  );
};

export default CourseCard;
