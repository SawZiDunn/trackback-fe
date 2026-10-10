export type LostItemStatus = "OPEN" | "RECOVERED" | "CLOSED";

export interface LostItem {
  id: string;
  title: string;
  description: string;
  category: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  status: LostItemStatus;
  photoUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LostItemsFilters {
  keyword?: string;
  category?: string;
  location?: string;
  status?: LostItemStatus;
}

export interface LostItemsResult {
  items: LostItem[];
  total: number;
  page: number;
}

export interface CreateLostItemPayload {
  title: string;
  description: string;
  category: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  photoUrl?: string;
}

export interface UpdateLostItemPayload {
  title: string;
  description: string;
  category: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  photoUrl?: string | null;
}

export interface CreateLostItemResponse {
  data: LostItem;
  message: string;
}

export interface UploadedImagesResponse {
  data: { url: string; publicId: string }[];
}
