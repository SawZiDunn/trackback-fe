"use client";

import axios from "axios";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { showToast } from "nextjs-toast-notify";
import { Button } from "@/common/components/Button";
import { useForgotPassword } from "../api/authApi";
import { AuthField } from "./AuthField";

export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    try {
      const response = await forgotPasswordMutation.mutateAsync({ email });
      setSubmittedEmail(email);
      setIsSubmitted(true);
      showToast.success(response.message || "Password reset instructions sent", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
    } catch (requestError) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : null;
      setError(message ?? "Unable to send reset instructions. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-neutral bg-neutral/30 p-4">
          <CheckCircle2 className="mt-0.5 text-primary shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-primary">Instructions sent</h3>
            <p className="mt-1 text-xs text-tertiary">
              We have sent password reset instructions to{" "}
              <span className="font-semibold text-primary">{submittedEmail}</span> if an account
              exists.
            </p>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white! transition hover:bg-secondary"
        >
          <ArrowLeft size={16} /> Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthField
        label="Campus email"
        name="email"
        placeholder="netid@university.edu"
        type="email"
      />
      <p className="text-xs leading-5 text-tertiary">
        Enter the email associated with your account, and we will send you a reset link.
      </p>
      <Button
        type="submit"
        className="h-12 w-full text-sm font-semibold"
        icon={<ArrowRight aria-hidden="true" size={16} />}
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending ? "Sending..." : "Send reset instructions"}
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
