import { Outlet } from "react-router-dom";
import { Header, InnovaFooter, Footer } from "@/shared/components";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 gap-10 ">{<Outlet />}</main>
      <div>
        <Footer />
        <InnovaFooter />
      </div>
    </div>
  );
};

export default MainLayout;
