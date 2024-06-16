"use client";

import { UpdateKitchenFormSchema } from "@/components/forms/UpdateKitchenForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useUpdateKitchen = (storeId?: string, kitchenId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateKitchenFormSchema>) => {
      const { data } = await axios.patch(
        `/api/stores/${storeId}/kitchens/${kitchenId}`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kitchens", storeId, kitchenId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kitchens", storeId],
      });

      router.replace(`/${storeId}/kitchens`);
    },
  });

  return mutation;
};
