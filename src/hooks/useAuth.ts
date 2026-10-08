import { useAuthContext } from "@/context/AuthProvider";

// Observer pattern: subscribes to authentication context
export function useAuth() {
  return useAuthContext();
}
