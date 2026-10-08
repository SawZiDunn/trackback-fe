import { Suspense } from "react";
import { AuthPage } from "@/components/auth/AuthPage";

export default function AuthResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage initialMode="reset-password" />
    </Suspense>
  );
}
