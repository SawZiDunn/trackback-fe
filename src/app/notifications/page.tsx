import { AuthGuard } from "@/common/components/AuthGuard";
import { NotificationsPage } from "@/modules/notifications/pages/NotificationsPage";

export default function Page() {
  return (
    <AuthGuard>
      <NotificationsPage />
    </AuthGuard>
  );
}
