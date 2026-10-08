"use client";

import axios from "axios";
import { ArrowRight, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { showToast } from "nextjs-toast-notify";
import { Button } from "@/common/components/Button";
import { useRegister } from "../api/authApi";
import { AuthField } from "./AuthField";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await registerMutation.mutateAsync({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        role: "user",
      });

      showToast.success(response.message || "Register Successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });

      router.push("/auth/login");
    } catch (requestError) {
      const message = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : null;
      setError(message ?? "Unable to create your account. Please try again.");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthField label="Full name" name="name" placeholder="Alex Morgan" />
      <AuthField
        label="Email"
        name="email"
        placeholder="netid@university.edu"
        type="email"
      />
      <AuthField
        label="Password"
        name="password"
        placeholder="Create a password"
        type="password"
        icon={<KeyRound aria-hidden="true" size={16} />}
      />
      <p className="text-xs leading-5 text-tertiary">
        Use your institutional email to create a verified campus account.
      </p>
      <Button
        type="submit"
        className="h-12 w-full text-sm font-semibold"
        icon={<ArrowRight aria-hidden="true" size={16} />}
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Creating account..." : "Create TrackBack account"}
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
