import { createContext, useContext, useState } from "react";
import type { AuthContextType } from "../auth.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [dashboardToken, setDashboardToken] = useState<string | null>(
    localStorage.getItem("dashboard-token"),
  );
  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };
  const dashboardLogin = (newToken: string) => {
    localStorage.setItem("dashboard-token", newToken);
    setDashboardToken(newToken);
  };
  const saveRefreshToken = (refreshToken: string) => {
    localStorage.setItem("refresh-token", refreshToken);
  };
  const saveRefreshTokenDashoard = (refreshToken: string) => {
    localStorage.setItem("dashboard-refresh-token", refreshToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const dashboardLogout = () => {
    localStorage.removeItem("dashboard-token");
    localStorage.removeItem("dashboard-refresh-token");
    setDashboardToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        dashboardToken,
        dashboardLogout,
        login,
        dashboardLogin,
        logout,
        saveRefreshToken,
        saveRefreshTokenDashoard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
