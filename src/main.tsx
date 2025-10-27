import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppRoutes from "./routes/AppRoutes.tsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AuthProvider } from "./features/auth/context/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LanguageProvider } from "./shared/localization/LanguageProvider.tsx";
import HtmlDirection from "./shared/utils/HtmlDirections.tsx";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "./features/auth/context/UserContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <HtmlDirection>
          <AuthProvider>
            <UserProvider>
              <AppRoutes />
              {import.meta.env.DEV && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
              <ToastContainer />
            </UserProvider>
          </AuthProvider>
        </HtmlDirection>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
