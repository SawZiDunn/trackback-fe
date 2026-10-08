import { apiClient } from "./client";

// DTO pattern: request contracts
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

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  profileUrl?: string | null;
  profilePublicId?: string | null;
}

// DTO pattern: response contracts
export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  profileUrl: string | null;
  profilePublicId?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
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
  userInfo: UserInfo;
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

// API methods
export async function registerUser(request: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/auth/register", request);
  return response.data;
}

export async function loginUser(request: LoginRequest): Promise<ApiResponse<LoginData>> {
  const response = await apiClient.post<ApiResponse<LoginData>>("/auth/login", request);
  return response.data;
}

export async function forgotPassword(
  request: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    request,
  );
  return response.data;
}

export async function resetPasswordUser(
  request: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ResetPasswordResponse>(
    `/auth/reset-password?token=${encodeURIComponent(request.token)}`,
    {
      token: request.token,
      password: request.password,
    },
  );
  return response.data ?? { message: "Password reset successfully" };
}

export async function getCurrentUser(): Promise<UserInfo> {
  const response = await apiClient.get<ApiResponse<UserInfo> | UserInfo>("/users/me");
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    response.data.data
  ) {
    return response.data.data as UserInfo;
  }
  return response.data as UserInfo;
}

export async function updateProfileUser(request: UpdateProfileRequest): Promise<UserInfo> {
  const response = await apiClient.patch<ApiResponse<UserInfo> | UserInfo>(
    "/users/me",
    request,
  );
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    response.data.data
  ) {
    return response.data.data as UserInfo;
  }
  return response.data as UserInfo;
}

export function getUser(userId: string) {
  return apiClient.get<ApiResponse<UserInfo>>(`/users/${userId}`);
}

export async function logoutUser(): Promise<LogoutResponse> {
  const response = await apiClient.delete<LogoutResponse>("/auth/logout");
  return response.data ?? { message: "Logout Successfully" };
}
