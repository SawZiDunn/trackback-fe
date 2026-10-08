"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/common/components/Button";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { TrustPanel } from "./TrustPanel";

export type AuthMode = "signin" | "register" | "forgot-password" | "reset-password";

export function AuthPage({ initialMode = "signin" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const [prevInitialMode, setPrevInitialMode] = useState<AuthMode>(initialMode);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
  }

  const isSignIn = mode === "signin";
  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot-password";
  const isResetPassword = mode === "reset-password";
  const showTabs = isSignIn || isRegister;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    if (nextMode === "signin") {
      router.push("/auth/login");
    } else if (nextMode === "register") {
      router.push("/auth/register");
    } else if (nextMode === "forgot-password") {
      router.push("/auth/forgot-password");
    } else {
      router.push("/auth/reset-password");
    }
  };

  const getHeading = () => {
    if (isForgotPassword) return "Reset your password";
    if (isResetPassword) return "Set a new password";
    return isSignIn ? "Welcome back" : "Create your account";
  };

  const getSubheading = () => {
    if (isForgotPassword) {
      return "Enter your campus email to receive a secure link to reset your password.";
    }
    if (isResetPassword) {
      return "Enter your new password below to regain access to your account.";
    }
    return isSignIn
      ? "Sign in with your campus credentials to report items, review custody statuses, or track claims."
      : "Register with your campus credentials to report and recover belongings securely.";
  };

  return (
    <main className="flex min-h-screen w-full items-stretch bg-background">
      <div className="flex min-h-screen w-full overflow-hidden bg-background">
        <TrustPanel />
        <section className="flex w-full flex-col p-7 sm:p-12 lg:w-[58%] lg:p-16">
          <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col">
            {showTabs ? (
              <div className="mb-10 grid shrink-0 grid-cols-2 rounded-md bg-neutral p-1">
                {(["signin", "register"] as const).map((tab) => {
                  const selected = mode === tab;
                  return (
                    <Button
                      key={tab}
                      type="button"
                      variant="tab"
                      active={selected}
                      aria-selected={selected}
                      role="tab"
                      onClick={() => switchMode(tab)}
                      className="h-9 rounded-[3px] text-xs font-semibold"
                    >
                      {tab === "signin" ? "Sign In" : "Create Account"}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-tertiary transition hover:text-primary cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            )}

            <div key={mode} className="min-h-117.5">
              <h2 className="text-3xl font-semibold tracking-[-0.06em]">{getHeading()}</h2>
              <p className="mt-2 max-w-md text-sm leading-5 text-tertiary">{getSubheading()}</p>
              <div className="mt-8">
                {isForgotPassword && <ForgotPasswordForm />}
                {isResetPassword && <ResetPasswordForm />}
                {isSignIn && <LoginForm />}
                {isRegister && <RegisterForm />}
              </div>

              {showTabs && (
                <p className="mt-8 text-center text-xs text-tertiary">
                  {isSignIn ? "New to TrackBack?" : "Already have an account?"}{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => switchMode(isSignIn ? "register" : "signin")}
                  >
                    {isSignIn ? "Create an account" : "Sign in"}
                  </Button>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
