"use client";

import { UpdateBillboardFormSchema } from "@/components/forms/UpdateBillboardForm.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useUpdateCategory = (storeId?: string, categoryId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateBillboardFormSchema>) => {
      const { data } = await axios.patch(
        `/api/stores/${storeId}/categories/${categoryId}`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stores", storeId, "categories", categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["stores", storeId],
      });
      router.replace(`/${storeId}/categories`);
    },
  });

  return mutation;
};
