import { Link } from "react-router-dom";
import EditIconCard from "@/assets/svgs/EditDashboardIcon.svg?react";
import DeleteButton from "@/features/Dashboard/components/DeleteButton";
const InstituteCards = ({ filteredItems, deleteInstitute }) => {
  return (
    <div className="sm:hidden grid grid-cols-1 gap-4">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <img
              src={item.logo}
              alt={item.translation.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold">{item.translation.name}</p>
              <p className="text-sm text-gray-500">{item.location}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">
              Created At: {item.createdAt}
            </p>
            <p className="mt-1">
              Status:{" "}
              <button
                className={`px-3 py-1 rounded-full border text-sm relative ${
                  item.translations[0].language.isActive
                    ? "border-green-500 text-green-500"
                    : "border-red-500 text-red-500"
                }`}
              >
                {item.translations[0].language.isActive ? "Active" : "Inactive"}
                <span
                  className={`absolute w-1 h-1 rounded-full start-2 top-1/2 -translate-y-1/2 inline-block ${
                    item.translations[0].language.isActive
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></span>
              </button>
            </p>
            <p className="mt-1 text-sm">
              Phone: {`${item.phone_key} ${item.phone}`}
            </p>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Link
              to={`/edit-institute/${item.id}`}
              className="text-blue-500 hover:text-blue-700 flex items-center"
            ></Link>
          </div>
          <DeleteButton
            deleteApi={() => deleteInstitute(item.id)}
            successMessage="تم حذف المستخدم بنجاح"
            errorMessage="حدث خطأ أثناء الحذف"
            refetchFunction="getInstitutesForDashboard"
            key={item.id}
          />
        </div>
      ))}
    </div>
  );
};

export default InstituteCards;
