"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { showToast } from "nextjs-toast-notify";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateProfileRequest,
  UserInfo,
} from "@/core/api/auth";
import { useAuthStore } from "@/core/store/useAuthStore";
import { authService } from "@/services/authService";

// Observer pattern: context consumers re-render when auth state changes
interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<RegisterResponse>;
  forgotPassword: (request: ForgotPasswordRequest) => Promise<ForgotPasswordResponse>;
  resetPassword: (request: ResetPasswordRequest) => Promise<ResetPasswordResponse>;
  updateProfile: (request: UpdateProfileRequest) => Promise<UserInfo>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on initial mount using cookies
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted && currentUser) {
          setUser(currentUser);
        }
      } catch {
        // If cookie is invalid or expired, clear user state
        if (isMounted) {
          clearUser();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuthSession();

    return () => {
      isMounted = false;
    };
  }, [setUser, clearUser]);

  const login = useCallback(
    async (request: LoginRequest) => {
      setIsLoading(true);
      try {
        const response = await authService.login(request);
        setUser(response.user);
        showToast.success(response.message || "Logged in successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  const register = useCallback(
    async (request: RegisterRequest): Promise<RegisterResponse> => {
      setIsLoading(true);
      try {
        const response = await authService.register(request);
        showToast.success(response.message || "Register Successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const forgotPassword = useCallback(
    async (request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      setIsLoading(true);
      try {
        const response = await authService.forgotPassword(request);
        showToast.success(response.message || "Password reset instructions sent", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (request: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
      setIsLoading(true);
      try {
        const response = await authService.resetPassword(request);
        showToast.success(response.message || "Password reset successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateProfile = useCallback(
    async (request: UpdateProfileRequest): Promise<UserInfo> => {
      setIsLoading(true);
      try {
        const updatedUser = await authService.updateProfile(request);
        setUser(updatedUser);
        showToast.success("Profile updated successfully", {
          duration: 4000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
        return updatedUser;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authService.logout();
      showToast.success(response.message || "Logout Successfully", {
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
    } finally {
      clearUser();
      setIsLoading(false);
    }
  }, [clearUser]);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: user !== null,
      user,
      login,
      register,
      forgotPassword,
      resetPassword,
      updateProfile,
      logout,
    }),
    [isLoading, login, register, forgotPassword, resetPassword, updateProfile, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Observer pattern: consumer hook
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
