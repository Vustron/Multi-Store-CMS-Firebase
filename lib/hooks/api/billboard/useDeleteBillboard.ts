"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useDeleteBillboard = (storeId?: string, billboardId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/stores/${storeId}/billboards/${billboardId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billboards", storeId, billboardId],
      });

      router.replace(`/${storeId}/billboards`);
    },
  });

  return mutation;
};
