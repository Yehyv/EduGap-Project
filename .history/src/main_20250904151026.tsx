import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppRoutes from "./routes/AppRoutes.tsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AuthProvider } from "./features/auth/context/AuthContext.tsx";
// الحالة الافتراضية للغة
const lang: "ar" | "en" = "ar";

// تعيين اتجاه الصفحة حسب اللغة
document.body.dir = lang === "ar" ? "rtl" : "ltr";
document.body.lang = lang;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);
