import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";
import type { MyPostsResult } from "../types/myPost";

const MY_POSTS_QUERY_KEY = ["my-posts"];
const API_PAGE_SIZE = 100;

export function useMyPosts() {
  return useQuery({
    queryKey: MY_POSTS_QUERY_KEY,
    queryFn: async (): Promise<MyPostsResult> => {
      const firstPageResponse = await apiClient.get<MyPostsResult>("/my-posts", {
        params: { page: 1, limit: API_PAGE_SIZE },
      });
      const firstPage = firstPageResponse.data;
      const pageCount = Math.ceil(firstPage.total / API_PAGE_SIZE);

      if (pageCount <= 1) return firstPage;

      const remainingPages = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
          apiClient.get<MyPostsResult>("/my-posts", {
            params: { page: index + 2, limit: API_PAGE_SIZE },
          }),
        ),
      );

      return {
        ...firstPage,
        items: [firstPage, ...remainingPages.map((response) => response.data)].flatMap(
          (result) => result.items,
        ),
      };
    },
    staleTime: 30_000,
  });
}

export { MY_POSTS_QUERY_KEY };
