import { Outlet } from "react-router-dom";
import { Header, InnovaFooter, Footer } from "@/shared/components";
import InstituteHeader from "@/shared/components/InstituteHeader";

const MainLayout = () => {
  const token = localStorage.getItem("token") ? true : false;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {token && <InstituteHeader />}
      <Header isLoggedIn={token} />
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
