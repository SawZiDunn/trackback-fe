export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  relatedItemId: string | null;
}

export interface NotificationsResult {
  items: Notification[];
  page: number;
  limit: number;
  total: number;
}
