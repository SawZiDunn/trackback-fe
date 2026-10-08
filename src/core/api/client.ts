import axios from "axios";
import { setupInterceptors } from "./interceptors";

// Shared Axios client instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

setupInterceptors(apiClient);
