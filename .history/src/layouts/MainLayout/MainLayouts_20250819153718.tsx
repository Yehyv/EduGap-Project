import { Outlet } from "react-router-dom";
import { Header, InnovaFooter } from "@/shared/components";
import Footer from "@/shared/components/InnovaFooter";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto">{<Outlet />}</main>
      <Footer />
      <InnovaFooter />
    </div>
  );
};

export default MainLayout;
