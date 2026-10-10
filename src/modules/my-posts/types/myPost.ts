export type MyPostType = "LOST" | "FOUND";
export type MyPostStatus = "OPEN" | "RECOVERED" | "PENDING_CLAIM" | "CLAIMED" | "CLOSED";

export interface MyPost {
  id: string;
  postType: MyPostType;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: MyPostStatus;
  photoUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyPostsResult {
  items: MyPost[];
  total: number;
  page: number;
  limit: number;
}

export interface MyPostUpdateValues {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  photoUrl?: string | null;
}
