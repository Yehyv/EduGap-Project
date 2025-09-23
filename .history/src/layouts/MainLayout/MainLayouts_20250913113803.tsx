import { Outlet } from "react-router-dom";
import { Header, InnovaFooter, Footer } from "@/shared/components";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 ">{<Outlet />}</main>
      <Footer />
      <InnovaFooter />
    </div>
  );
};

export default MainLayout;
