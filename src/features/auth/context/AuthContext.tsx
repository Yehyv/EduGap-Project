import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthContextType, InstAdminInfo } from "../auth.types";
import { dashboardApi } from "@/shared/services/dashboardApi";

interface DashboardTokenPayload {
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [dashboardToken, setDashboardToken] = useState<string | null>(
    localStorage.getItem("dashboard-token"),
  );
  const [instAdminInfo, setInstAdminInfo] = useState<InstAdminInfo | null>(
    () => {
      const stored = localStorage.getItem("inst-admin-info");
      if (!stored) return null;
      try {
        return JSON.parse(stored) as InstAdminInfo;
      } catch {
        return null;
      }
    },
  );

  const role = useMemo<string | null>(() => {
    if (!dashboardToken) return null;
    try {
      const decoded = jwtDecode<DashboardTokenPayload>(dashboardToken);
      return decoded.role ?? null;
    } catch {
      return null;
    }
  }, [dashboardToken]);

  // Fetch inst admin info automatically when role is INST_ADMIN and token exists
  useEffect(() => {
    if (role !== "INST_ADMIN" || !dashboardToken) return;

    // If already hydrated from localStorage, skip the fetch
    if (instAdminInfo) return;

    dashboardApi
      .get<{ data: InstAdminInfo }>("/system-users/me/minimal")
      .then((res) => {
        const info = res.data.data;
        localStorage.setItem("inst-admin-info", JSON.stringify(info));
        setInstAdminInfo(info);
      })
      .catch(() => {
        // silently fail — instAdminInfo stays null
      });
  }, [role, dashboardToken]);

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
    localStorage.removeItem("inst-admin-info");
    setDashboardToken(null);
    setInstAdminInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        dashboardToken,
        role,
        instAdminInfo,
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
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
