import { showToast } from "nextjs-toast-notify";
import { useProfile as useProfileQuery, useUpdateProfile } from "../api/profileApi";
import type { UpdateProfilePayload } from "../types/profile";

export function useProfile(userId?: string) {
  const profileQuery = useProfileQuery(userId);
  const updateProfileMutation = useUpdateProfile();

  const updateProfile = async (payload: UpdateProfilePayload) => {
    try {
      const result = await updateProfileMutation.mutateAsync(payload);
      showToast.success(result.message || "Update Successfully", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
      });
      return result.user;
    } catch (error) {
      showToast.error("Failed to update profile", {
        duration: 4000,
        position: "top-right",
      });
      throw error;
    }
  };

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
  };
}
