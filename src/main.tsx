import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppRoutes from "./routes/AppRoutes.tsx";

// الحالة الافتراضية للغة
const lang: "ar" | "en" = "ar";

// تعيين اتجاه الصفحة حسب اللغة
document.body.dir = lang === "ar" ? "rtl" : "ltr";
document.body.lang = lang;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
