"use client";

import { KitchenFormSchema } from "@/components/forms/CreateKitchenForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useCreateKitchen = (storeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof KitchenFormSchema>) => {
      const { data } = await axios.post(
        `/api/stores/${storeId}/kitchens`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kitchens", storeId],
      });
      router.replace(`/${storeId}/kitchens`);
    },
  });

  return mutation;
};
