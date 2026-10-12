import { AuthGuard } from "@/common/components/AuthGuard";
import { FoundItemsPage } from "@/modules/found-items/pages/FoundItemsPage";

export default function Page() {
  return (
    <AuthGuard>
      <FoundItemsPage />
    </AuthGuard>
  );
}
