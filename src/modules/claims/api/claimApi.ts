import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import type {
  Claim,
  ClaimDetail,
  ClaimRole,
  ClaimStatus,
  ClaimsResult,
  ReviewDecision,
  SubmitClaimPayload,
  UploadedImagesResponse,
} from "../types/claim";

const CLAIMS_QUERY_KEY = ["claims"];
const FOUND_ITEMS_QUERY_KEY = ["found-items"];
const MY_POSTS_QUERY_KEY = ["my-posts"];
const PAGE_SIZE = 8;

// Submit a claim on a found item post. Proof photo uploads first, then the
// returned URL is sent with the claim payload (same flow as report forms).
export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      foundItemPostId,
      payload,
      proofImage,
    }: {
      foundItemPostId: string;
      payload: SubmitClaimPayload;
      proofImage?: File;
    }): Promise<Claim> => {
      let proofPhotoUrl = payload.proofPhotoUrl;
      if (proofImage) {
        const formData = new FormData();
        formData.append("image", proofImage);
        const uploadResponse = await apiClient.post<UploadedImagesResponse>(
          "/media/image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        proofPhotoUrl = uploadResponse.data.data[0]?.url;
        if (!proofPhotoUrl) {
          throw new Error("The image upload did not return an image URL.");
        }
      }

      const response = await apiClient.post<Claim>(`/found-items/${foundItemPostId}/claims`, {
        ...payload,
        ...(proofPhotoUrl ? { proofPhotoUrl } : {}),
      });
      return response.data;
    },
    onSuccess: (_claim, variables) => {
      queryClient.invalidateQueries({ queryKey: FOUND_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...FOUND_ITEMS_QUERY_KEY, variables.foundItemPostId] });
      queryClient.invalidateQueries({ queryKey: CLAIMS_QUERY_KEY });
    },
  });
}

// List claims for the current user — as claimant (mine) or as finder (toReview)
export function useClaims(role: ClaimRole, status: ClaimStatus | "", page: number) {
  return useQuery({
    queryKey: [...CLAIMS_QUERY_KEY, role, status, page],
    queryFn: async (): Promise<ClaimsResult> => {
      const response = await apiClient.get<ClaimsResult>("/claims", {
        params: {
          role,
          ...(status ? { status } : {}),
          page,
          limit: PAGE_SIZE,
        },
      });
      return response.data;
    },
  });
}

export function useClaim(claimId: string) {
  return useQuery({
    queryKey: [...CLAIMS_QUERY_KEY, claimId],
    queryFn: async (): Promise<ClaimDetail> => {
      const response = await apiClient.get<ClaimDetail>(`/claims/${claimId}`);
      return response.data;
    },
    enabled: Boolean(claimId),
  });
}

// Finder approves or rejects a pending claim
export function useReviewClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      decision,
    }: {
      claimId: string;
      decision: ReviewDecision;
    }): Promise<Claim> => {
      const response = await apiClient.patch<Claim>(`/claims/${claimId}/review`, { decision });
      return response.data;
    },
    onSuccess: (claim) => {
      queryClient.invalidateQueries({ queryKey: CLAIMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOUND_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CLAIMS_QUERY_KEY, claim.id] });
    },
  });
}
