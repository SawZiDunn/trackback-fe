export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  profileUrl: string | null;
  profilePublicId?: string | null;
  about?: string | null;
  role: UserRole | string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
