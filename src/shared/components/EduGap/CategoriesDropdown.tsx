import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { CategoriesResponse } from "@/shared/types/sharedTypes";

const CategoriesDropdown = ({
  categories,
}: {
  categories: CategoriesResponse;
}) => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);

  return (
    <div className="relative">
      {/* Categories Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-3 end-0 bg-white shadow-lg rounded-xl min-w-[200px] z-40"
      >
        {categories?.categories?.map((category) => (
          <div
            key={category.id}
            className="relative group"
            onMouseEnter={() => setHoveredCategoryId(category.id)}
            onMouseLeave={() => setHoveredCategoryId(null)}
          >
            <div className="p-3 hover:bg-gray-100 rounded-md cursor-pointer transition">
              {category.name}
            </div>

            {/* Courses dropdown */}
            {hoveredCategoryId === category.id && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 end-full ml-0 bg-white shadow-lg rounded-xl p-3 min-w-[250px] z-50"
              >
                {category?.items?.slice(0, 6).map((course) => (
                  <Link
                    key={course.id}
                    to={`/user-course-details/${course.id}`}
                    className="flex items-center gap-3 px-1 py-2 hover:bg-gray-100 rounded-md transition"
                  >
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-bold">{course.name}</span>
                      {course.educator && <span>{course.educator.name}</span>}
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default CategoriesDropdown;
