import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import { useAppStore } from "@/core/store/useAppStore";
import { normalizeUser } from "@/modules/auth/api/authApi";
import type { User } from "@/modules/auth/types/auth";
import type { UpdateProfileApiResponse, UpdateProfilePayload } from "../types/profile";

// Fetch user profile by ID or current user
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId ?? "me"],
    queryFn: async () => {
      const endpoint = userId ? `/users/${userId}` : "/users/me";
      const response = await apiClient.get(endpoint);
      return normalizeUser(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Update profile with optional file upload (multipart/form-data)
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload): Promise<{ user: User; message: string }> => {
      const formData = new FormData();

      if (payload.name !== undefined && payload.name.trim().length > 0) {
        formData.append("name", payload.name.trim());
      }

      if (payload.email !== undefined && payload.email.trim().length > 0) {
        formData.append("email", payload.email.trim());
      }

      if (payload.password !== undefined && payload.password.trim().length > 0) {
        formData.append("password", payload.password.trim());
      }

      if (payload.about !== undefined) {
        formData.append("about", payload.about);
      }

      if (payload.profileFile) {
        formData.append("profileUrl", payload.profileFile);
      }

      const response = await apiClient.patch<UpdateProfileApiResponse>("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = normalizeUser(response.data?.response ?? response.data?.data ?? response.data);
      const message = response.data?.message ?? "Update Successfully";

      setUser(updatedUser);
      return { user: updatedUser, message };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["currentUser"], result.user);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
