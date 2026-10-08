import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiClient } from "@/core/api/client";
import { useAppStore } from "@/core/store/useAppStore";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from "../types/auth";

// Domain helper: normalize user response structure across different backend payload shapes
export function normalizeUser(data: unknown): User {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if ("response" in record && record.response) {
      return record.response as User;
    }
    if ("data" in record && record.data) {
      return record.data as User;
    }
    return record as unknown as User;
  }
  return data as User;
}

// Fetch current user details with fallback
export function useCurrentUser(fallbackUserId?: string) {
  const setUser = useAppStore((state) => state.setUser);
  const clearUser = useAppStore((state) => state.clearUser);

  return useQuery({
    queryKey: ["currentUser", fallbackUserId],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/users/me");
        const normalized = normalizeUser(response.data);
        setUser(normalized);
        return normalized;
      } catch (error) {
        if (fallbackUserId && axios.isAxiosError(error) && error.response?.status === 404) {
          const response = await apiClient.get(`/users/${fallbackUserId}`);
          const normalized = normalizeUser(response.data);
          setUser(normalized);
          return normalized;
        }
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearUser();
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

// Login mutation hook
export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<{ user: User; message: string }> => {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email: data.email.trim(),
        password: data.password,
        rememberMe: data.rememberMe ?? false,
      });

      let user: User = response.data.data.userInfo;

      // Ensure fresh user profile state if available
      try {
        const freshUserResponse = await apiClient.get("/users/me");
        const freshUser = normalizeUser(freshUserResponse.data);
        if (freshUser) {
          user = freshUser;
        }
      } catch {
        // Fall back to login response payload
      }

      setUser(user);
      return {
        user,
        message: response.data.message || "Logged in successfully",
      };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["currentUser"], result.user);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// Register mutation hook
export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<RegisterResponse> => {
      const response = await apiClient.post<RegisterResponse>("/auth/register", {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role,
      });
      return response.data;
    },
  });
}

// Logout mutation hook
export function useLogout() {
  const queryClient = useQueryClient();
  const clearUser = useAppStore((state) => state.clearUser);

  return useMutation({
    mutationFn: async (): Promise<LogoutResponse> => {
      try {
        const response = await apiClient.delete<LogoutResponse>("/auth/logout");
        return response.data;
      } catch {
        return { message: "Logout Successfully" };
      }
    },
    onSettled: () => {
      clearUser();
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.clear();
    },
  });
}

// Forgot password mutation hook
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", {
        email: data.email.trim(),
      });
      return response.data;
    },
  });
}

// Reset password mutation hook
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
      const response = await apiClient.post<ResetPasswordResponse>(
        `/auth/reset-password?token=${encodeURIComponent(data.token)}`,
        data,
      );
      return response.data;
    },
  });
}
