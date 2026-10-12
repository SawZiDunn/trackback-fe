export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ClaimRole = "mine" | "toReview";

export type ReviewDecision = "approve" | "reject";

export interface Claim {
  id: string;
  status: ClaimStatus;
  justification: string;
  itemDetails: string;
  proofPhotoUrl: string | null;
  foundItemPostId: string;
  claimantUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitClaimPayload {
  justification: string;
  itemDetails: string;
  proofPhotoUrl?: string;
}

export interface ClaimsResult {
  items: Claim[];
  page: number;
  limit: number;
  total: number;
}

export interface ClaimDetail {
  id: string;
  status: ClaimStatus;
  claimant: { id: string };
  claim: {
    justification: string;
    itemDetails: string;
    proofPhotoUrl: string | null;
  };
  foundItem: {
    id: string;
    title: string;
    category: string;
    description: string;
    foundLocation: string;
    foundDate: string;
    photoUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UploadedImagesResponse {
  data: { url: string; publicId: string }[];
}
