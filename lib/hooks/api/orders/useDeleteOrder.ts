"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useDeleteOrder = (storeId?: string, orderId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/stores/${storeId}/orders/${orderId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", storeId, orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", storeId],
      });

      router.replace(`/${storeId}/orders`);
    },
  });

  return mutation;
};
