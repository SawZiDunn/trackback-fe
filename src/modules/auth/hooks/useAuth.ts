import { useCallback } from "react";
import { showToast } from "nextjs-toast-notify";
import { useAppStore } from "@/core/store/useAppStore";
import {
  useCurrentUser,
  useForgotPassword,
  useLogin,
  useLogout,
  useRegister,
  useResetPassword,
} from "../api/authApi";
import { useUpdateProfile } from "@/modules/profile/api/profileApi";
import type { UpdateProfilePayload } from "@/modules/profile/types/profile";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from "../types/auth";

// Wrapper hook around auth API mutations and global state
export function useAuth() {
  const storedUser = useAppStore((state) => state.user);

  // Background fetch to verify/refresh current user
  const currentUserQuery = useCurrentUser(storedUser?.id);
  const user: User | null = currentUserQuery.data ?? storedUser;

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const updateProfileMutation = useUpdateProfile();

  const login = useCallback(
    async (request: LoginRequest): Promise<void> => {
      try {
        const response = await loginMutation.mutateAsync(request);
        showToast.success(response.message || "Logged in successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
      } catch (error) {
        throw error;
      }
    },
    [loginMutation],
  );

  const register = useCallback(
    async (request: RegisterRequest): Promise<RegisterResponse> => {
      try {
        const response = await registerMutation.mutateAsync(request);
        showToast.success(response.message || "Register Successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
    [registerMutation],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const response = await logoutMutation.mutateAsync();
      showToast.success(response?.message || "Logout Successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
    } catch {
      showToast.success("Logout Successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
    }
  }, [logoutMutation]);

  const forgotPassword = useCallback(
    async (request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      try {
        const response = await forgotPasswordMutation.mutateAsync(request);
        showToast.success(response.message || "Password reset instructions sent", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
    [forgotPasswordMutation],
  );

  const resetPassword = useCallback(
    async (request: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
      try {
        const response = await resetPasswordMutation.mutateAsync(request);
        showToast.success(response.message || "Password reset successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
    [resetPasswordMutation],
  );

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<User> => {
      try {
        const response = await updateProfileMutation.mutateAsync(payload);
        showToast.success(response.message || "Update Successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return response.user;
      } catch (error) {
        throw error;
      }
    },
    [updateProfileMutation],
  );

  const isLoading =
    (currentUserQuery.isLoading && !storedUser) ||
    loginMutation.isPending ||
    logoutMutation.isPending;

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}
