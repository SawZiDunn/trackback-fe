import { AuthGuard } from "@/common/components/AuthGuard";
import { LostItemDetailPage } from "@/modules/lost-items/pages/LostItemDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AuthGuard>
      <LostItemDetailPage itemId={id} />
    </AuthGuard>
  );
}
