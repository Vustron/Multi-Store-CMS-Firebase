"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useDeleteCuisine = (storeId?: string, cuisineId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/stores/${storeId}/cuisines/${cuisineId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stores", storeId, "cuisines", cuisineId],
      });
      queryClient.invalidateQueries({
        queryKey: ["stores", storeId],
      });

      router.replace(`/${storeId}/cuisines`);
    },
  });

  return mutation;
};
