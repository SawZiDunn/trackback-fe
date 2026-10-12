import { AuthGuard } from "@/common/components/AuthGuard";
import { ClaimsPage } from "@/modules/claims/pages/ClaimsPage";

export default function Page() {
  return (
    <AuthGuard>
      <ClaimsPage />
    </AuthGuard>
  );
}
