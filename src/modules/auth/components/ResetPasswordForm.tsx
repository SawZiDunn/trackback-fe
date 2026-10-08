"use client";

import axios from "axios";
import { ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { showToast } from "nextjs-toast-notify";
import { Button } from "@/common/components/Button";
import { useResetPassword } from "../api/authApi";
import { AuthField } from "./AuthField";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const resetPasswordMutation = useResetPassword();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing. Please use the link provided in your email.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({ token, password });
      setIsSuccess(true);
      showToast.success(response.message || "Password reset successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
    } catch (requestError) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : null;
      setError(message ?? "Reset link is invalid or expired. Please request a new one.");
    }
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <p className="font-semibold">Invalid or missing reset token</p>
          <p className="mt-1">
            This password reset link is missing a valid token. Please request a new reset email.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white transition hover:bg-secondary"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-neutral bg-neutral/30 p-4">
          <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-primary">Password updated</h3>
            <p className="mt-1 text-xs text-tertiary">
              Your password has been successfully reset. You can now log in with your new
              credentials.
            </p>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white transition hover:bg-secondary"
        >
          Sign In to TrackBack
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthField
        label="New password"
        name="password"
        placeholder="Enter new password"
        type="password"
        icon={<KeyRound aria-hidden="true" size={16} />}
      />
      <AuthField
        label="Confirm new password"
        name="confirmPassword"
        placeholder="Confirm new password"
        type="password"
        icon={<KeyRound aria-hidden="true" size={16} />}
      />
      <p className="text-xs leading-5 text-tertiary">
        Make sure your password is at least 6 characters long and secure.
      </p>
      <Button
        type="submit"
        className="h-12 w-full text-sm font-semibold"
        icon={<ArrowRight aria-hidden="true" size={16} />}
        disabled={resetPasswordMutation.isPending}
      >
        {resetPasswordMutation.isPending ? "Updating password..." : "Reset password"}
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
