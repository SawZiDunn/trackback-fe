import {
  forgotPassword,
  getCurrentUser,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordUser,
  updateProfileUser,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type LoginRequest,
  type LogoutResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type UpdateProfileRequest,
  type UserInfo,
} from "@/core/api/auth";

// Facade pattern: encapsulates auth API operations
export const authService = {
  async login(request: LoginRequest): Promise<{ user: UserInfo; message: string }> {
    const response = await loginUser(request);
    let user: UserInfo = response.data.userInfo;

    try {
      const freshUser = await getCurrentUser();
      if (freshUser) {
        user = freshUser;
      }
    } catch {
      // Fallback to userInfo provided in login response
    }

    return {
      user,
      message: response.message,
    };
  },

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await logoutUser();
      return {
        message: response?.message ?? "Logout Successfully",
      };
    } catch {
      return {
        message: "Logout Successfully",
      };
    }
  },

  async getCurrentUser(): Promise<UserInfo> {
    return await getCurrentUser();
  },

  async getUser(userId: string): Promise<UserInfo> {
    const response = await getUser(userId);
    return "data" in response.data ? response.data.data : response.data;
  },

  async updateProfile(request: UpdateProfileRequest): Promise<UserInfo> {
    return await updateProfileUser(request);
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return await registerUser(request);
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return await forgotPassword(request);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return await resetPasswordUser(request);
  },
};
