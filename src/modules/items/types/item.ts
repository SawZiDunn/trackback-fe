export type ItemType = "LOST" | "FOUND";

export type ItemStatus = "OPEN" | "RECOVERED" | "CLOSED" | "PENDING_CLAIM" | "CLAIMED";

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: ItemStatus;
  photoUrl: string | null;
  type: ItemType;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchItemsParams {
  query: string;
  limit?: number;
}

export interface SearchItemsResult {
  items: Item[];
  total: number;
}