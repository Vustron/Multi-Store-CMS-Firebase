"use client";

import { UpdateKitchenFormSchema } from "@/components/forms/UpdateKitchenForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useUpdateCuisine = (storeId?: string, cuisineId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateKitchenFormSchema>) => {
      const { data } = await axios.patch(
        `/api/stores/${storeId}/cuisines/${cuisineId}`,
        values,
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
