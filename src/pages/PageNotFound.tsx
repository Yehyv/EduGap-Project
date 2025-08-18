import { lazy, Suspense } from "react";
import LightButton from "@/shared/components/ui/LightButton";
import { useNavigate } from "react-router-dom";
import Loader from "@/shared/components/Loader";

const NotFoundLottie = lazy(() => import("@/shared/components/NotFoundLottie"));

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto">
          <Suspense fallback={<Loader />}>
            <NotFoundLottie />
          </Suspense>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mt-6">
          الصفحة غير موجودة
        </h2>
        <p className="text-gray-500 mt-2">
          يبدو أنك وصلت إلى رابط غير صحيح. يمكنك العودة للصفحة الرئيسية بسهولة.
        </p>

        <LightButton
          text="العودة للصفحة الرئيسية"
          onClick={() => navigate("/")}
        />
      </div>
    </div>
  );
};

export default PageNotFound;
