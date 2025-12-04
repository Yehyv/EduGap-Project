import { Outlet } from "react-router-dom";
import { Header, InnovaFooter } from "@/shared/components";

const AboutLayout = () => {
  const token = localStorage.getItem("token") ? true : false;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header isLoggedIn={token} color="white" />
      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 gap-10 ">{<Outlet />}</main>
      <div>
        <InnovaFooter />
      </div>
    </div>
  );
};

export default AboutLayout;
