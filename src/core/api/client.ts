import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Singleton pattern: shared Axios client
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor pattern: handle 401 Unauthorized for protected endpoints
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      // Clear session on protected endpoints when token/cookie is invalid or expired
      if (!isAuthEndpoint) {
        useAuthStore.getState().clearUser();
      }
    }

    return Promise.reject(error);
  },
);
