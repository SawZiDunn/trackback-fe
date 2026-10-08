import { Suspense } from "react";
import { AuthPage } from "@/components/auth/AuthPage";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage initialMode="reset-password" />
    </Suspense>
  );
}
