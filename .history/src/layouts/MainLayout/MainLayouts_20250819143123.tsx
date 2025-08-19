import { Outlet } from "react-router-dom";
import { Header, Footer } from "@/shared/components";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto">{<Outlet />}</main>

      <Footer />
    </div>
  );
};

export default MainLayout;
