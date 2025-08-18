import { Footer, Header } from "@/shared/components";

import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
