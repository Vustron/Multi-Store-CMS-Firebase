"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useDeleteKitchen = (storeId?: string, kitchenId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/stores/${storeId}/kitchens/${kitchenId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kitchens", storeId, kitchenId],
      });

      router.replace(`/${storeId}/kitchens`);
    },
  });

  return mutation;
};
