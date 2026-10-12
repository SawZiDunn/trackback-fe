import { ClaimDetailPage } from "@/modules/claims/pages/ClaimDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClaimDetailPage claimId={id} />;
}
