"use client";

import { showToast } from "nextjs-toast-notify";
import { Button } from "@/common/components/Button";
import { useLogout } from "../api/authApi";

interface LogoutButtonProps {
  className?: string;
  variant?: "primary" | "tab" | "link";
}

export function LogoutButton({ className = "", variant = "primary" }: LogoutButtonProps) {
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      const response = await logoutMutation.mutateAsync();
      showToast.success(response?.message || "Logout Successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
    } catch {
      showToast.success("Logout Successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      disabled={logoutMutation.isPending}
      onClick={handleLogout}
      className={className}
    >
      {logoutMutation.isPending ? "Logging out..." : "Log out"}
    </Button>
  );
}
