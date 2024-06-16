"use client";

import { SizeFormSchema } from "@/components/forms/CreateSizeForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useCreateSize = (storeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof SizeFormSchema>) => {
      const { data } = await axios.post(`/api/stores/${storeId}/sizes`, values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sizes", storeId],
      });
      router.replace(`/${storeId}/sizes`);
    },
  });

  return mutation;
};
