"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useDeleteProduct = (storeId?: string, productId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/stores/${storeId}/products/${productId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", storeId, productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", storeId],
      });

      router.replace(`/${storeId}/products`);
    },
  });

  return mutation;
};
