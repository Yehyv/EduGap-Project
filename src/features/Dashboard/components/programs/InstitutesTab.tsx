import { Link } from "react-router-dom";
import { Building2, Users, BookOpen } from "lucide-react";
import CircleLoader from "@/shared/components/ui/CircleLoader";
import type { Institute } from "./types";

interface InstitutesTabProps {
  institutes: Institute[];
  isLoading: boolean;
}

const InstitutesTab = ({ institutes, isLoading }: InstitutesTabProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-center items-center py-12">
          <CircleLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex gap-2 items-center mb-6">
        <Building2 className="w-6 h-6 text-secondary" />
        <h5 className="text-lg font-semibold text-secondary">
          المعاهد المشاركة في البرنامج
        </h5>
      </div>

      {institutes.length > 0 ? (
        <>
          <p className="text-gray-600 mb-6">
            يتم تقديم هذا البرنامج من خلال {institutes.length}{" "}
            {institutes.length === 1 ? "معهد" : "معاهد"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutes.map((institute, index) => (
              <Link
                key={`${institute.instituteId}-${index}`}
                to={`/dashboard/institutes/${institute.instituteId}`}
                className="group"
              >
                <div className="p-4 rounded-lg hover:bg-gray-50 transition-all border border-gray-100 hover:border-secondary/30 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    {/* Institute Logo */}
                    <div className="flex-shrink-0">
                      {institute.logo ? (
                        <img
                          src={institute.logo}
                          alt={institute.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-secondary" />
                        </div>
                      )}
                    </div>

                    {/* Institute Info */}
                    <div className="flex-1 min-w-0">
                      <h6 className="font-semibold text-gray-800 mb-2 group-hover:text-secondary transition-colors truncate">
                        {institute.name}
                      </h6>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-secondary" />
                          <span>
                            {institute.coursesCount}{" "}
                            {institute.coursesCount === 1
                              ? "Course"
                              : "Courses"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-secondary" />
                          <span>
                            {institute.studentsCount}{" "}
                            {institute.studentsCount === 1
                              ? "Student"
                              : "Students"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">
            لا توجد معاهد مرتبطة بهذا البرنامج
          </p>
          <p className="text-gray-400 text-sm">
            سيتم عرض المعاهد هنا عند إضافتها للبرنامج
          </p>
        </div>
      )}
    </div>
  );
};

export default InstitutesTab;
