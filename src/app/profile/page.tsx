import { AuthGuard } from "@/common/components/AuthGuard";
import { ProfilePage } from "@/modules/profile/pages/ProfilePage";

export default function Page() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}
