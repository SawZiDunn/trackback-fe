"use client";

import axios from "axios";
import { ArrowRight, Eye, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../common/button";
import { AuthField } from "./AuthField";

export function SignInForm() {
  const router = useRouter();
  // Observer pattern: consume login action from auth context
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        rememberMe: formData.get("rememberMe") === "on",
      });
      router.push("/");
    } catch (requestError) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : null;
      setError(message ?? "Unable to sign in. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthField label="Email" name="email" placeholder="netid@university.edu" type="email" />
      <AuthField
        label="Password"
        name="password"
        placeholder="Enter your password"
        type="password"
        icon={<KeyRound aria-hidden="true" size={16} />}
        trailingIcon={<Eye aria-hidden="true" size={15} />}
      />
      <div className="flex items-center justify-between gap-4 text-xs text-tertiary">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="rememberMe"
            defaultChecked={false}
            className="h-4 w-4 rounded border-neutral accent-primary"
          />
          Remember me
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-xs font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        className="h-12 w-full text-sm font-semibold"
        icon={<ArrowRight aria-hidden="true" size={16} />}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign In to TrackBack"}
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
