import { AuthGuard } from "@/common/components/AuthGuard";
import { MyPostsPage } from "@/modules/my-posts/pages/MyPostsPage";

export default function Page() {
  return (
    <AuthGuard>
      <MyPostsPage />
    </AuthGuard>
  );
}
