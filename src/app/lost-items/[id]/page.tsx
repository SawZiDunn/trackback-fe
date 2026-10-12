import { LostItemDetailPage } from "@/modules/lost-items/pages/LostItemDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LostItemDetailPage itemId={id} />;
}
