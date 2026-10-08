"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../common/button";
import { RegisterForm } from "./RegisterForm";
import { SignInForm } from "./SignInForm";
import TrustPanel from "./TrustPanel";

type AuthMode = "signin" | "register";

export function AuthPage({ initialMode = "signin" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isSignIn = mode === "signin";
  
  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    router.push(`/auth/${nextMode === "signin" ? "login" : "register"}`);
  };

  return (
    <main className="flex min-h-screen w-full items-stretch bg-background">
      <div className="flex min-h-screen w-full overflow-hidden bg-background">
        <TrustPanel />
        <section className="flex w-full flex-col p-7 sm:p-12 lg:w-[58%] lg:p-16">
          <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col">
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
            <div key={mode} className="min-h-117.5">
              <h2 className="text-3xl font-semibold tracking-[-0.06em]">
                {isSignIn ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-5 text-tertiary">
                {isSignIn
                  ? "Sign in with your campus credentials to report items, review custody statuses, or track claims."
                  : "Register with your campus credentials to report and recover belongings securely."}
              </p>
              <div className="mt-8">{isSignIn ? <SignInForm /> : <RegisterForm />}</div>
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
