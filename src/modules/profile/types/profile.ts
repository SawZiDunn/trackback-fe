import type { User } from "@/modules/auth/types/auth";

export type Profile = User;

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
  about?: string;
  profileFile?: File | null;
}

export type UpdateProfilePayload = UpdateProfileRequest;

export interface UpdateProfileApiResponse {
  response?: User;
  data?: User;
  message?: string;
}
