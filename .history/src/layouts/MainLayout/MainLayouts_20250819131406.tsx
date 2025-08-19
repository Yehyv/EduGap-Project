import { Outlet } from "react-router-dom";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4">
        {/* If you use react-router, use <Outlet /> */}
        {<Outlet />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
