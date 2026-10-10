export type FoundItemStatus = "OPEN" | "PENDING_CLAIM" | "CLAIMED" | "CLOSED";

export interface FoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  foundLocation: string;
  foundDate: string;
  status: FoundItemStatus;
  photoUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoundItemsFilters {
  keyword?: string;
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: FoundItemStatus;
}

export interface FoundItemsResult {
  items: FoundItem[];
  total: number;
  page: number;
}

export interface UpdateFoundItemPayload {
  title?: string;
  description?: string;
  category?: string;
  foundLocation?: string;
  foundDate?: string;
  photoUrl?: string | null;
}

export interface UploadedImagesResponse {
  data: { url: string; publicId: string }[];
}
