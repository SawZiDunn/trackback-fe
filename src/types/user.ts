// Domain model (Domain Layer): User entity shared across UI, State Stores, and Services
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  profileUrl: string | null;
  profilePublicId?: string | null;
  about?:string | null;
  role: UserRole | string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type UserInfo = User;
