"use client";

import { BillboardFormSchema } from "@/components/forms/CreateBillboardForm.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";

export const useCreateBillboard = (storeId?: string) => {
  // init query client
  const queryClient = useQueryClient();
  // init router
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof BillboardFormSchema>) => {
      const { data } = await axios.post(
        `/api/stores/${storeId}/billboards`,
        values,
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      router.replace(`/${storeId}/billboards`);
      // window.location.assign(`/${data?.id}`);
    },
  });

  return mutation;
};