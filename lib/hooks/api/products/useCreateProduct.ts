"use client";

import { ProductFormSchema } from "@/components/forms/CreateProductForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useCreateProduct = (storeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof ProductFormSchema>) => {
      const { data } = await axios.post(
        `/api/stores/${storeId}/products`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", storeId],
      });
      router.replace(`/${storeId}/products`);
    },
  });

  return mutation;
};
