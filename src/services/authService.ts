import axios from "axios";
import {
  deleteLogout,
  getMe,
  getUserById,
  patchMe,
  postForgotPassword,
  postLogin,
  postRegister,
  postResetPassword,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type LoginRequest,
  type LogoutResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
} from "@/core/api/auth";
import type { User } from "@/types/user";

// Business Logic Layer
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  password?: string;
  about?:string | undefined;
  profileFile?: File | null;
}

// Domain helper: unrolls and normalizes user payloads from different backend wrappers
function normalizeUser(data: unknown): User {
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

// Business Logic Layer: owns validation, transformations, fallback policies, and orchestration
export const authService = {
  /**
   * Orchestrates login: authenticates credentials and ensures fresh user profile state
   */
  async login(request: LoginRequest): Promise<{ user: User; message: string }> {
    const response = await postLogin({
      email: request.email.trim(),
      password: request.password,
      rememberMe: request.rememberMe,
    });

    let user: User = response.data.userInfo;

    try {
      const freshUser = await this.getCurrentUser(response.data.userInfo.id);
      if (freshUser) {
        user = freshUser;
      }
    } catch {
      // Graceful degradation: fallback to login response payload
    }

    return {
      user,
      message: response.message,
    };
  },

  /**
   * Orchestrates user registration with sanitized input
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return await postRegister({
      name: request.name.trim(),
      email: request.email.trim(),
      password: request.password,
      role: request.role,
    });
  },

  /**
   * Safe logout with fallback message
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await deleteLogout();
      return {
        message: response?.message ?? "Logout Successfully",
      };
    } catch {
      return {
        message: "Logout Successfully",
      };
    }
  },


  async getCurrentUser(fallbackUserId?: string): Promise<User> {
    try {
      const rawUser = await getMe();
      return normalizeUser(rawUser);
    } catch (error) {
      if (fallbackUserId && axios.isAxiosError(error) && error.response?.status === 404) {
        const rawUser = await getUserById(fallbackUserId);
        return normalizeUser(rawUser);
      }
      throw error;
    }
  },

  async getUser(userId: string): Promise<User> {
    const rawUser = await getUserById(userId);
    return normalizeUser(rawUser);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<{ user: User; message: string }> {
    const formData = new FormData();

    if (payload.name !== undefined && payload.name.trim().length > 0) {
      formData.append("name", payload.name.trim());
    }

    if (payload.email !== undefined && payload.email.trim().length > 0) {
      formData.append("email", payload.email.trim());
    }

    if (payload.password !== undefined && payload.password.trim().length > 0) {
      formData.append("password", payload.password.trim());
    }

    if (payload.about !== undefined) {
      formData.append("about", payload.about);
    }

    if (payload.profileFile) {
      formData.append("profileUrl", payload.profileFile);
    }

    const res = await patchMe(formData);
    const user = normalizeUser(res.response ?? res);
    const message = res.message ?? "Update Successfully";

    return { user, message };
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return await postForgotPassword({
      email: request.email.trim(),
    });
  },

  /**
   * Complete password reset
   */
  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return await postResetPassword(request);
  },
};
