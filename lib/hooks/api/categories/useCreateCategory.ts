"use client";

import { CategoryFormSchema } from "@/components/forms/CreateCategoryForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useCreateCategory = (storeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof CategoryFormSchema>) => {
      const { data } = await axios.post(
        `/api/stores/${storeId}/categories`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stores", storeId],
      });
      router.replace(`/${storeId}/categories`);
    },
  });

  return mutation;
};
