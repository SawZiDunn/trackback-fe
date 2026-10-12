import { AuthGuard } from "@/common/components/AuthGuard";
import { ClaimDetailPage } from "@/modules/claims/pages/ClaimDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AuthGuard>
      <ClaimDetailPage claimId={id} />
    </AuthGuard>
  );
}
