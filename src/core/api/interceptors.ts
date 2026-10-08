import type { AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import { useAppStore } from "../store/useAppStore";

export function setupInterceptors(client: AxiosInstance): AxiosInstance {
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const isAuthEndpoint = error.config?.url?.includes("/auth/");

        // Clear session on protected endpoints when token/cookie is invalid or expired
        if (!isAuthEndpoint) {
          useAppStore.getState().clearUser();
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}
