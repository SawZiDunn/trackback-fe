"use client";

import { Suspense } from "react";
import { AuthPage } from "../components/AuthPage";

export function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage initialMode="reset-password" />
    </Suspense>
  );
}

export default ResetPasswordPage;
