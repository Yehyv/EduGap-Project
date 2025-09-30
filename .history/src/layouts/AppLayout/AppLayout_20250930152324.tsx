import { Outlet } from "react-router-dom";
import { Header, InnovaFooter, Footer } from "@/shared/components";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header isLoggedIn />
      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 gap-10">{<Outlet />}</main>
      <Footer />
      <InnovaFooter />
    </div>
  );
};

export default AppLayout;
