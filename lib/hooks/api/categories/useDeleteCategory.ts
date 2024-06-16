"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useDeleteCategory = (storeId?: string, categoryId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/stores/${storeId}/categories/${categoryId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories", storeId, categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["categories", storeId],
      });

      router.replace(`/${storeId}/categories`);
    },
  });

  return mutation;
};
