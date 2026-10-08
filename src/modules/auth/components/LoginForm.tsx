"use client";

import axios from "axios";
import { ArrowRight, Eye, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { showToast } from "nextjs-toast-notify";
import { Button } from "@/common/components/Button";
import { useLogin } from "../api/authApi";
import { AuthField } from "./AuthField";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await loginMutation.mutateAsync({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        rememberMe: formData.get("rememberMe") === "on",
      });

      showToast.success(result.message || "Logged in successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });

      router.push("/");
    } catch (requestError) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : null;
      setError(message ?? "Unable to sign in. Please check your credentials and try again.");
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
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "Signing in..." : "Sign In to TrackBack"}
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

// Keep SignInForm as alias for backward compatibility
export const SignInForm = LoginForm;
