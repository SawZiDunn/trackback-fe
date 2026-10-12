import { AuthGuard } from "@/common/components/AuthGuard";
import { LostItemsPage } from "@/modules/lost-items/pages/LostItemsPage";

export default function Page() {
  return (
    <AuthGuard>
      <LostItemsPage />
    </AuthGuard>
  );
}
