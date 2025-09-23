import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Refresh token API call
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
      { refreshToken }
    );

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken;

    if (newAccessToken) {
      localStorage.setItem("token", newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    return newAccessToken;
  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw err;
  }
};

// 🔹 Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const lang = localStorage.getItem("lang");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (lang) {
      config.headers["languageId"] = lang === "en" ? "1" : "2";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response interceptor with refresh flow
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // wait until refreshing is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
