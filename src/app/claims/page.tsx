import { AuthGuard } from "@/common/components/AuthGuard";
import { ClaimsPage } from "@/modules/claims/pages/ClaimsPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <AuthGuard>
      <ClaimsPage initialRole={tab === "toReview" ? "toReview" : "mine"} />
    </AuthGuard>
  );
}
