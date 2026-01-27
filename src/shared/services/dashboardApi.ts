/* ================= DASHBOARD API ================= */

import axios from "axios";

export const dashboardApi = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===== Dashboard Refresh ===== */
let isDashboardRefreshing = false;
let dashboardQueue: any[] = [];

const processDashboardQueue = (error: any, token: string | null = null) => {
  dashboardQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  dashboardQueue = [];
};

const refreshDashboardToken = async () => {
  const refreshToken = localStorage.getItem("dashboard-refresh-token");
  if (!refreshToken) throw new Error("No dashboard refresh token");

  const res = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/system-auth/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  const newAccessToken = res.data?.data?.accessToken;
  const newRefreshToken = res.data?.data?.refreshToken;

  localStorage.setItem("dashboard-token", newAccessToken);
  localStorage.setItem("dashboard-refresh-token", newRefreshToken);

  return newAccessToken;
};

/* ===== Dashboard Request ===== */
dashboardApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("dashboard-token");
  const lang = localStorage.getItem("lang");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (lang) {
    config.headers["languageId"] = lang === "ar" ? "1" : "2";
  }
  return config;
});

/* ===== Dashboard Response ===== */
dashboardApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isDashboardRefreshing) {
        return new Promise((resolve, reject) => {
          dashboardQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return dashboardApi(originalRequest);
        });
      }

      originalRequest._retry = true;
      isDashboardRefreshing = true;

      try {
        const newToken = await refreshDashboardToken();
        processDashboardQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return dashboardApi(originalRequest);
      } catch (err) {
        processDashboardQueue(err, null);
        localStorage.removeItem("dashboard-token");
        localStorage.removeItem("dashboard-refresh-token");
        window.location.href = "/dashboard/login";
        throw err;
      } finally {
        isDashboardRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
