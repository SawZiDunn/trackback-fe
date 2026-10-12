import { FoundItemDetailPage } from "@/modules/found-items/pages/FoundItemDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FoundItemDetailPage itemId={id} />;
}
