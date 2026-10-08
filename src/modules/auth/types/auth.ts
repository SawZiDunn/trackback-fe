import type { ApiResponse } from "@/core/types/api";
import type { User, UserRole } from "@/core/types/common";

export type { User, UserRole };
export type UserInfo = User;

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "user";
}

export interface RegisterUserData {
  id: string;
  name: string;
  email: string;
  profileUrl: string | null;
  profilePublicId: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RegisterResponse {
  data: RegisterUserData;
  message: string;
}

export type RegisterResponseData = RegisterUserData;

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginData {
  accessToken: string;
  userInfo: User;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}
