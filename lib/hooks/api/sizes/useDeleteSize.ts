"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useDeleteSize = (storeId?: string, sizeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/stores/${storeId}/sizes/${sizeId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sizes", storeId, sizeId],
      });

      router.replace(`/${storeId}/sizes`);
    },
  });

  return mutation;
};
