import {
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordUser,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type LoginRequest,
  type LogoutResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type UserInfo,
} from "@/core/api/auth";

// Facade pattern: encapsulates auth API operations
export const authService = {
  async login(request: LoginRequest): Promise<{ user: UserInfo; message: string }> {
    const response = await loginUser(request);
    let user: UserInfo = response.data.userInfo;

    try {
      const userResponse = await getUser(response.data.userInfo.id);
      if (userResponse.data?.data) {
        user = userResponse.data.data;
      }
    } catch(error){
      console.log("error", error)
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

  async getCurrentUser(userId: string): Promise<UserInfo> {
    const response = await getUser(userId);
    return response.data.data;
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await registerUser(request);
    return response;
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await forgotPassword(request);
    return response;
  },

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await resetPasswordUser(request);
    return response;
  },
};
