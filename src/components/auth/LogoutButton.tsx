"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "../common/button";

interface LogoutButtonProps {
  className?: string;
  variant?: "primary" | "tab" | "link";
}

// Observer pattern: LogoutButton subscribes to AuthProvider state (logout, isLoading) via useAuth
export function LogoutButton({ className = "", variant = "primary" }: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      type="button"
      variant={variant}
      disabled={isLoading}
      onClick={() => logout()}
      className={className}
    >
      {isLoading ? "Logging out..." : "Log out"}
    </Button>
  );
}
