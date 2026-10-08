import type { User, UserInfo } from "@/types/user";
import { apiClient } from "./client";

// Re-export User/UserInfo domain types for API consumers if needed
export type { User, UserInfo };

// DTO contracts: Raw API requests
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "user";
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// DTO contracts: Raw API responses
export interface ApiResponse<T> {
  data: T;
  message: string;
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

export interface LoginData {
  accessToken: string;
  userInfo: User;
}

export interface LogoutResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UpdateProfileApiResponse {
  response: User;
  message: string;
}

// Pure HTTP Transport Layer (No business logic, no form parsing, no fallbacks)
export async function postRegister(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/auth/register", data);
  return response.data;
}

export async function postLogin(data: LoginRequest): Promise<ApiResponse<LoginData>> {
  const response = await apiClient.post<ApiResponse<LoginData>>("/auth/login", data);
  return response.data;
}

export async function deleteLogout(): Promise<LogoutResponse> {
  const response = await apiClient.delete<LogoutResponse>("/auth/logout");
  return response.data;
}

export async function postForgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", data);
  return response.data;
}

export async function postResetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ResetPasswordResponse>(
    `/auth/reset-password?token=${encodeURIComponent(data.token)}`,
    data,
  );
  return response.data;
}

export async function getMe(): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>("/users/me");
  return response.data;
}

export async function getUserById(userId: string): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>(`/users/${userId}`);
  return response.data;
}

export async function patchMe(
  data: FormData | Record<string, unknown>,
): Promise<UpdateProfileApiResponse> {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const response = await apiClient.patch<UpdateProfileApiResponse>("/users/me", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
}
