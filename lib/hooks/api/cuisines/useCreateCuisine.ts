"use client";

import { CuisineFormSchema } from "@/components/forms/CreateCuisineForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useCreateCuisine = (storeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof CuisineFormSchema>) => {
      const { data } = await axios.post(
        `/api/stores/${storeId}/cuisines`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stores", storeId],
      });
      router.replace(`/${storeId}/cuisines`);
    },
  });

  return mutation;
};
